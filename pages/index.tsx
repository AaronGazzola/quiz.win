import type { NextPage } from "next";
import Editor from "../components/editor/Editor";

const Home: NextPage = () => {
  return (
    <div className='flex'>
      <div className='w-1/2 p-5'>
        <Editor />
      </div>
      <div className='w-1/2 p-5'></div>
    </div>
  );
};

export default Home;
