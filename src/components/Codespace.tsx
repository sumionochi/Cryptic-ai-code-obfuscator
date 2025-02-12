"use client"
import React, { useContext, useEffect } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import Files from '@/data/Files';
import { MessageContext } from '@/lib/MessageContext';
import Prompt from '@/data/Prompt';
import { useParams } from 'next/navigation';

type Props = {}

interface Message {
  role: 'user' | 'ai'; 
  content: string;
}

const Codespace = (props: Props) => {
  const params = useParams()
  const workspaceId = params.id
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = React.useState('code');
  const [files, setFiles] = React.useState(Files?.DEFAULT_FILES);
  const {messages, setMessages} = useContext(MessageContext) as {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  };

  useEffect(() => {
    if (messages?.length > 0) {
      const lastMessage = messages[messages?.length - 1].role;
      if (lastMessage === 'user') {
        Generated_AiCode();
      }
    }
  }, [messages]);

  useEffect(() => {
    const GetFiles = async () => {
      try {
        const response = await fetch(`/api/workspace/${workspaceId}`);
        const data = await response.json();
        console.log(data)
        const mergedFiles = { ...Files.DEFAULT_FILES, ...data?.fileData };
        setFiles(mergedFiles);
      } catch (error) {
        console.error("Error fetching workspace files:", error);
        setFiles(Files.DEFAULT_FILES);
      }
    };

    if (workspaceId) {
      GetFiles();
    }
  }, [workspaceId]);

  const Generated_AiCode = async () => {
    const prompt_string = JSON.stringify(messages) + " " +Prompt.CODE_GEN_PROMPT;
    const response = await fetch(`/api/ai_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt_string,
      }),
    });
    const data = await response.json();
    console.log("Here is the ai_code response", data);
    try {
      const codeFiles = JSON.parse(data.result);
      const mergedFiles = { ...Files.DEFAULT_FILES, ...codeFiles?.files};
      setFiles(mergedFiles);
      
      // Add file update API call
      await fetch('/api/workspace/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId,
          files: codeFiles?.files,
        }),
      });
    } catch (error) {
      console.error("Error parsing code files:", error);
      setFiles(Files.DEFAULT_FILES);
    }
  }

  return (
    <div className='mt-1 border h-[100%]'>
      <div className='bg-white dark:bg-black'>
        <div className='bg-white flex flex-row gap-0 dark:bg-black'>
          <Button size={"sm"} variant="ghost" onClick={()=>setActiveTab('code')} className={`rounded-none glassmorphism ${activeTab=='code' && 'text-teal-500'}`}>Code</Button>
          <Button size={"sm"} variant="ghost" onClick={()=>setActiveTab('preview')} className={`rounded-none glassmorphism ${activeTab=='preview' && 'text-teal-500'}`}>Preview</Button>
        </div>
      </div>
      <SandpackProvider template="react" theme={theme === "dark" ? "dark" : "light"} files={files} customSetup={{dependencies:{...Files.DEPENDANCY}}} options={{
          externalResources: ["https://cdn.tailwindcss.com"]
        }}>
        <SandpackLayout>
          {activeTab=='code' && (
            <>
            <SandpackFileExplorer style={{height:'84vh'}}/>
            <SandpackCodeEditor style={{height:'84vh'}} />
            </>
          )}
          {activeTab=='preview' && (
            <SandpackPreview showNavigator={true} style={{height:'84vh'}} />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}

export default Codespace