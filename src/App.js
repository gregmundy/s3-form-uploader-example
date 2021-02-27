import React from "react";
import "./App.css";

import SingleUploadForm from "./components/SingleUploadForm";
import MultiPartUploadForm from "./components/MultiPartUploadForm";

const App = () => {
  return (
    <div>
      <SingleUploadForm />
      <MultiPartUploadForm />
    </div>
  );
};

export default App;
