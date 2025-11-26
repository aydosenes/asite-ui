import Auth from "../components/Auth";

export default function Home() {
  return (
    <Auth>
      <div className="w-full h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">Home Page</h1>
      </div>
    </Auth>
  );
}
