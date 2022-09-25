import TextNodeToolbarButton from "./TextNodeToolbarButton";
import { TextNodeToolbarButtons } from "./ToolbarButtons";

const TextNodeToolbar = () => {
  return (
    <div className='bg-white flex rounded items-center border border-gray-200 shadow-md mb-1.5 box-content overflow-hidden'>
      {TextNodeToolbarButtons.map(toolbarButton => (
        <TextNodeToolbarButton
          key={toolbarButton.type}
          toolbarButton={toolbarButton}
        />
      ))}
    </div>
  );
};

export default TextNodeToolbar;
