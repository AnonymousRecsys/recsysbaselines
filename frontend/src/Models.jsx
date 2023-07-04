import React, { useEffect, useState } from "react";
import { Select } from 'antd';

const ModelsContext = React.createContext({
  models: [],
  fetchModels: () => {}
})

export default function SelectModels({onChangeCallback}) {
  const [models, setModels] = useState([]);

  const fetchModels = async () => {
    const response = await fetch("http://194.58.103.30:9931/get_models");
    // const response = await fetch("http://localhost:9931/get_models");
    const models = await response.json();
    setModels(models.data);
  }

  useEffect(() => {
    fetchModels();
  }, [])

  return (
    <ModelsContext.Provider value={{models, fetchModels}}>
      <Select
        mode="tags"
        style={{ minWidth: '50vw', maxWidth: '50vw' }}
        placeholder="Select model"
        onChange={onChangeCallback}
        options={models}
        size="large"
      />
    </ModelsContext.Provider>
  );
}