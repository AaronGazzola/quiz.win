import type { NextPage } from "next";
import { useContext } from "react";
import Editor from "../components/editor/Editor";
import EditorContext from "../context/editorContext";

const Home: NextPage = () => {
  const { editorState } = useContext(EditorContext);
  return (
    <div className='flex'>
      <div className='w-1/2 p-5'>
        <Editor />
      </div>
      <div className='w-1/2 p-5'>{JSON.stringify(editorState)}</div>
    </div>
  );
};

export default Home;
