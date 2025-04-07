import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ModalForm from "./modalForm";

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre
          {...props}
          className={`${className} text-sm w-[80dvw] md:max-w-[500px] overflow-x-scroll bg-zinc-100 p-3 rounded-lg mt-2 dark:bg-zinc-800`}
        >
          <code className={match[1]}>{children}</code>
        </pre>
      ) : (
        <code
          className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
          {...props}
        >
          {children}
        </code>
      );
    },
    ol: ({ node, children, ...props }: any) => {
      return (
        <ol className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }: any) => {
      return (
        <li className="py-1" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }: any) => {
      return (
        <ul className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }: any) => {
      return (
        <span className="font-semibold" {...props}>
          {children}
        </span>
      );
    },
    a: ({ node, children, ...props }: any) => {
      return (
        <a
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    h1: ({ node, children, ...props }: any) => {
      return (
        <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }: any) => {
      return (
        <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }: any) => {
      return (
        <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }: any) => {
      return (
        <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
          {children}
        </h4>
      );
    },
    h5: ({ node, children, ...props }: any) => {
      return (
        <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
          {children}
        </h5>
      );
    },
    h6: ({ node, children, ...props }: any) => {
      return (
        <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
          {children}
        </h6>
      );
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>


  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

// import React, { useState } from "react";

// export const Markdown = ({ children }: { children: string }) => {
//   const [selectedOption, setSelectedOption] = useState<string>("true");

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSelectedOption(event.target.value);
//   };

//   return (
//     <div className="p-4 bg-white rounded-md shadow-md">
//       <h2 className="text-lg font-semibold mb-4">Select Type</h2>
//       <form className="flex flex-col gap-4">
//         <label className="flex items-center gap-2">
//           <input
//             type="radio"
//             name="type"
//             value="true"
//             checked={selectedOption === "true"}
//             onChange={handleChange}
//             className="h-4 w-4 border border-gray-300 rounded-full text-primary focus:ring-2 focus:ring-blue-500"
//           />
//           True
//         </label>
//         <label className="flex items-center gap-2">
//           <input
//             type="radio"
//             name="type"
//             value="false"
//             checked={selectedOption === "false"}
//             onChange={handleChange}
//             className="h-4 w-4 border border-gray-300 rounded-full text-primary focus:ring-2 focus:ring-blue-500"
//           />
//           False
//         </label>
//       </form>
//     </div>
//   );
// };

// export default Markdown;

// import React, { useState, memo } from "react";

// const MarkdownComponent = ({ children }: { children: string }) => {
//   const [selectedOption, setSelectedOption] = useState<string>("true");

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSelectedOption(event.target.value);
//   };

//   return (
//     <div className="p-4 bg-white rounded-md shadow-md">
//       <h2 className="text-lg font-semibold mb-4">Select Type</h2>
//       <form className="flex flex-col gap-4">
//         <label className="flex items-center gap-2">
//           <input
//             type="radio"
//             name="type"
//             value="true"
//             checked={selectedOption === "true"}
//             onChange={handleChange}
//             className="h-4 w-4 border border-gray-300 rounded-full text-primary focus:ring-2 focus:ring-blue-500"
//           />
//           True
//         </label>
//         <label className="flex items-center gap-2">
//           <input
//             type="radio"
//             name="type"
//             value="false"
//             checked={selectedOption === "false"}
//             onChange={handleChange}
//             className="h-4 w-4 border border-gray-300 rounded-full text-primary focus:ring-2 focus:ring-blue-500"
//           />
//           False
//         </label>
//       </form>
//     </div>
//   );
// };

// // Wrap the component in React.memo
// export const Markdown = memo(MarkdownComponent, (prevProps, nextProps) => {
//   // Only re-render if the children prop changes
//   return prevProps.children === nextProps.children;
// });


// import React, { useState, memo } from "react";

// const MarkdownComponent = () => {
//   const [selectedOption, setSelectedOption] = useState<string>("true");

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSelectedOption(event.target.value);
//   };

//   return (
//     <div className="p-4 bg-white rounded-md shadow-md">
//       <h2 className="text-lg font-semibold mb-4">Select Type</h2>
//       <form className="flex flex-col gap-4">
//         {/* Radio Button for "True" */}
//         <label className="flex items-center gap-2">
//           <input
//             type="radio"
//             name="type"
//             value="true"
//             checked={selectedOption === "true"}
//             onChange={handleChange}
//             className="h-4 w-4 border border-gray-300 rounded-full text-primary focus:ring-2 focus:ring-blue-500"
//           />
//           True
//         </label>

//         {/* Radio Button for "False" */}
//         <label className="flex items-center gap-2">
//           <input
//             type="radio"
//             name="type"
//             value="false"
//             checked={selectedOption === "false"}
//             onChange={handleChange}
//             className="h-4 w-4 border border-gray-300 rounded-full text-primary focus:ring-2 focus:ring-blue-500"
//           />
//           False
//         </label>
//       </form>

//       {/* Display Selected Option */}
//       <div className="mt-4 text-sm text-gray-600">
//         <strong>Selected Option:</strong> {selectedOption}
//       </div>
//     </div>
//   );
// };

// // Wrap the component in React.memo
// export const Markdown = memo(MarkdownComponent, (prevProps, nextProps) => {
//   // Prevent re-rendering since there are no props to compare
//   return true;
// });