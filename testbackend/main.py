import json
import ollama
import chromadb
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware

# Load sentence-transformer model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use ["*"] to allow all origins or specify like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

RULES_FILE = "segment_rules1.json"
# RESTRICTIONS_FILE = "restrictions.txt"

# RESTRICTIONS = open(RESTRICTIONS_FILE, "r").read()

chroma_client = chromadb.PersistentClient(path="./chroma_db")
rules_collection = chroma_client.get_or_create_collection(name="rules")

# --- Load Rules into ChromaDB ---
# def load_rules_into_chromadb():
#     try:
#         with open(RULES_FILE, "r") as f:
#             for line in f:
#                 if line.strip():
#                     rule = json.loads(line.strip())
#                     rules_collection.add(
#                         ids=[rule["message"]],
#                         documents=[json.dumps(rule)],
#                         metadatas=[{"description": json.dumps(rule)}],
#                     )
#     except FileNotFoundError:
#         print("No existing rules found in JSONL.")

def load_rules_into_chromadb():
    from sentence_transformers import SentenceTransformer
    embedder = SentenceTransformer("all-MiniLM-L6-v2")

    try:
        with open(RULES_FILE, "r") as f:
            for rule in json.load(f):
                    text_for_embedding = f"{rule["tags"]}"
                    embedding = embedder.encode(text_for_embedding).tolist()

                    rules_collection.add(
                        ids=[rule["message"]],
                        documents=[json.dumps(rule)],
                        metadatas=[{"description": json.dumps(rule["elements"])}],
                        embeddings=[embedding]
                    )
    except FileNotFoundError:
        print("No existing rules found in JSONL.")

load_rules_into_chromadb()

# --- Llama 3.2 Chat Function ---
def chat_with_llama(messages: List[Dict]):
    response = ollama.chat(model="llama3.2", messages=messages)
    return response["message"]["content"]

# --- Data Models ---
class UserInput(BaseModel):
    message: str
    chat_history: List[Dict] = []

class EventData(BaseModel):
    event_traits: Dict[str, str]

# --- Conversational Rule Selection ---
@app.post("/chat")
async def chat_with_agent(user_input: UserInput):
    user_embedding = embedding_model.encode(user_input.message).tolist()
    search_results = rules_collection.query(
        query_embeddings=[user_embedding],
        query_texts=[user_input.message],
        n_results=1
    )

    if not search_results["documents"]:
        return {"message": "No matching rule found.", "chat_history": user_input.chat_history}

    matching_rule_json = search_results["documents"][0][0]  # First result
    if not matching_rule_json:
        return {"message": "No matching rule found.", "chat_history": user_input.chat_history}
    else:
        matching_rule_json = json.loads(matching_rule_json).get("elements", {})
    matching_rule = matching_rule_json

    # system_prompt = f"""
    # You are an AI Agent. Your task:
    #     1. Summarize the best matching rule.
    #     2. Ask the user for additional details if needed.
    #     3. Confirm the rule before finalizing.
    #     4. If any body want all sample rules, please say give the dummy rule as {
    #         {
    #             "name": "rule_name",
    #             "description": "rule_description",
    #             "help_text": "any additional info",
    #             "steps": [
    #                 {
    #                     "step_name": "step_name",
    #                     "description": "step_description",
    #                     "help_text": "any additional info",
    #                     "conditions": [
    #                         {
    #                             "path_to_property": "property_path",
    #                             "value": "expected_value"
    #                         }
    #                     ]
    #                 }
    #             ]
    #         }
    #     }
    #     5. Just give the rule name and description.
    #     6. If you need to ask for more details, please say "I need more information about the rule".
    #     7. When user have wanted more specific rule then return the message with found rule. without any raw or json structure.

    # Rule (in JSON):
    # {json.dumps(matching_rule, indent=2)}
    # """

    system_prompt = f"""
        You are an CDP AI Agent. And your name is Xplor CDP. Your task:
        **Rules**:
            1. You are an AI agent that validates user input based on dynamic JSON rules.
            2. Don't send direct text response. Just send the message in the message key.
        **Restrictions**:
            1. Don't talk about any other things in the response.
            2. Modify the steps if required else dont change any name or description. things from rules
        **Allowed**:
            1. Check if any rules follow or contains the word.
            2. If you need to ask for more details, please say "I need more information about the rule".
            3. This is vector DB search if any of rule from that matches user requirement then return the message with found rule. without any raw or json structure.
            4. Once you found the rule is perfect then return response as that as it is json in rule key and message key as the message.
                e.g. {json.dumps({
                    "rule": {},
                    "message": ""
                })}
            5. Found rule is: {json.dumps(matching_rule, indent=2)}
            6. If rule found no message outside of json object
            7. Regular messages should be have the same format as the example like hi. Just send message in the message key. Dont share rule. Just gritting message.
            8. Regular message should be in the message key. And rule should be in the rule key.
                e.g. {json.dumps({
                    "rule": "",
                    "message": "Hello! How can I assist you today?"
                })}
            9. If user is giving you greeting message then just return the message in the message key. And rule should be in the empty string. and always return greeting message with greeting message or normal human message.
            10. I found response was not correct on hello message. So please dont return the rule in the message key. Just return the message in the message key.
            11. When i asked 'give me more details how this works' it not send the message in message key and rule key with empty object. As `I can help you to find the CDP rule. By gathering the information from you, I will search for a relevant rule that matches your requirements and provide you with the details of the rule found. Please let me know what you are looking for in terms of rules, and I will do my best to assist you.` add this message in message key.
        **Not Allowed** Don't send incorrect json format
        **HOW TO RESPOND ON ACTUAL RULE MESSAGE**:
            1. User input is "give me members with hot"
            2. And the rule is you received is:
                {json.dumps({
                    "name": "hot members",
                    "description": "Target members showing high engagement",
                    "help_text": "This filters users who are members and are classified as 'hot'",
                    "marketing_automation_external_account_id": "au:01",
                    "steps": [
                        {
                            "type": "radio",
                            "step": 1,
                            "name": "Contact type",
                            "external_id": "signed_up",
                            "options": [
                                {
                                    "display_name": "Prospect",
                                    "option_id": 1,
                                    "value": "false"
                                },
                                {
                                    "display_name": "Member",
                                    "option_id": 2,
                                    "value": "true"
                                }
                            ],
                            "default": {
                                "option_id": 2
                            }
                        },
                        {
                            "type": "multiselect",
                            "step": 2,
                            "name": "Engagement State",
                            "external_id": "prospect_state",
                            "default": {
                                "option": {
                                    "contains": [
                                        "hot"
                                    ]
                                }
                            }
                        }
                    ]
                })}
            3. Then the response should be:
                {json.dumps({
                    "rule": {
                    "name": "hot members",
                    "description": "Target members showing high engagement",
                    "help_text": "This filters users who are members and are classified as 'hot'",
                    "marketing_automation_external_account_id": "au:01",
                    "steps": [
                        {
                            "type": "radio",
                            "step": 1,
                            "name": "Contact type",
                            "external_id": "signed_up",
                            "options": [
                                {
                                    "display_name": "Prospect",
                                    "option_id": 1,
                                    "value": "false"
                                },
                                {
                                    "display_name": "Member",
                                    "option_id": 2,
                                    "value": "true"
                                }
                            ],
                            "default": {
                                "option_id": 2
                            }
                        },
                        {
                            "type": "multiselect",
                            "step": 2,
                            "name": "Engagement State",
                            "external_id": "prospect_state",
                            "default": {
                                "option": {
                                    "contains": [
                                        "hot"
                                    ]
                                }
                            }
                        }
                    ]
                },
                "message": "You are looking for members with a high engagement level. The rule 'hot members' matches your request. It filters users who are members and classified as 'hot'."
                })
            }
            **NOTE**:
            this is dummy response and it's rule may change on provided found rule.
        4. Default value from rule will be different on user input. So please dont change the default value from rule after getting the rule
        5. Response should be valid JSON format.
    """
    chat_history = [{"role": "system", "content": system_prompt}] + user_input.chat_history
    chat_history.append({"role": "user", "content": user_input.message})

    ai_response = chat_with_llama(chat_history)

    # return {
        # "rule": matching_rule,
        # "message": ai_response,
        # "message": json.loads(ai_response),
        # "chat_history": chat_history
    # }
    return json.loads(ai_response)

# --- Store Confirmed Rules ---
@app.post("/store_rule")
async def store_rule(rule: Dict):
    with open(RULES_FILE, "a") as file:
        file.write(json.dumps(rule) + "\n")

    rules_collection.add(
        ids=[rule["name"]],
        documents=[json.dumps(rule)],
        metadatas=[{"description": rule["description"]}]
    )

    return {"message": "Rule stored successfully!"}

# --- Real-Time Event Evaluation ---
@app.post("/evaluate")
async def evaluate_event(event_data: EventData):
    event_traits = event_data.event_traits
    matching_rules = []

    for rule in rules_collection.get()["documents"]:
        rule_obj = json.loads(rule)
        conditions = rule_obj.get("audience_criteria", {}).get("condition_list", [])

        if all(
            event_traits.get(cond["path_to_property"]) == cond["value"]
            for cond in conditions
        ):
            matching_rules.append(rule_obj["name"])

    system_prompt = f"""
    You are an AI assistant evaluating real-time events.
    - Event Data: {json.dumps(event_traits, indent=2)}
    - Matching Rules: {matching_rules}

    Explain if this event is a valid match based on the rules.
    """

    ai_response = chat_with_llama([{"role": "system", "content": system_prompt}])

    return {"matched_rules": matching_rules, "ai_explanation": ai_response}

# --- Run FastAPI Server ---
if __name__ == "__main__":
    import uvicorn
    print("FastAPI Running at http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
