import "../style/Loader.css";

type LoaderProps = {
  text?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
};

export default function Loader({
  text = "Loading...",
  size = "medium",
  fullScreen = false,
}: LoaderProps) {
  const content = (
    <div className={`loader-wrapper loader-${size}`}>
      <div className="loader-spinner">
        <div className="loader-ring" />
        <div className="loader-ring" />
        <div className="loader-ring" />
      </div>

      {text && <p className="loader-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loader-fullscreen">{content}</div>;
  }

  return content;
}