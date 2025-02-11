"use client"
import React from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { useTheme } from 'next-themes';
import { Button } from './ui/button';

type Props = {}

const Codespace = (props: Props) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = React.useState('code')
  return (
    <div className='mt-1 border h-[100%]'>
      <div className='bg-white dark:bg-black'>
        <div className='bg-white flex flex-row gap-0 dark:bg-black'>
          <Button size={"sm"} variant="ghost" onClick={()=>setActiveTab('code')} className={`rounded-none glassmorphism ${activeTab=='code' && 'text-teal-500'}`}>Code</Button>
          <Button size={"sm"} variant="ghost" onClick={()=>setActiveTab('preview')} className={`rounded-none glassmorphism ${activeTab=='preview' && 'text-teal-500'}`}>Preview</Button>
        </div>
      </div>
      <SandpackProvider template="react" theme={theme === "dark" ? "dark" : "light"}>
        <SandpackLayout>
          <SandpackFileExplorer style={{height:'83.5vh'}}/>
          <SandpackCodeEditor style={{height:'83.5vh'}} />
          <SandpackPreview style={{height:'83.5vh'}} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}

export default Codespace