import React, { useState } from "react";

import SelectModels from "./Models";

import { Layout, Space, Button, Popover, Alert } from 'antd';

import { Col, Row, Typography } from 'antd';

const { Content } = Layout;
const { Text } = Typography;



const contentStyle = {
  color: '#fff',
  backgroundColor: '#108ee9',
  minHeight: '100vh'
};

const App = () => {
  const [selectedModels, setSelectedModels] = useState([]);
  const [descriptions, setDescriptions] = useState([]);

  const handleModels = (models) => {
    setSelectedModels(models);
  };

  const handleSend = () => {
    if (selectedModels.length === 0) {
      return;
    }

    fetch("http://194.58.103.30:9931/get_descriptions", {
    // fetch("http://localhost:9931/get_descriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedModels)
    }).then((resp) => {
      return resp.json()
    }).then((values) => {
      if (values.data.length !== 0) {
        setDescriptions(values.data);
      }
    })

  };

  const getDescription = (modelTitle, paperTitle, paperYear, paperUrl, paperAbstract, paperScore, i) => {
    return (
      <div style={{borderBottom: '1px solid white', size: '100%'}} key={i}>
        <h3>{i}. {modelTitle}</h3>
        <p>Paper title: {paperTitle}</p>
        <p>Paper year: {paperYear}</p>
        <p><Popover placement="rightBottom" content=<p style={{maxWidth: '50vw'}}>{paperAbstract}</p>><a href="#" style={{'color': 'white', 'textDecoration': 'underline'}}>Abstract</a></Popover></p>
        <p><a href={paperUrl} rel="noreferrer" target="_blank" style={{'color': 'white', 'textDecoration': 'underline'}}>Go to paper</a></p>
        <p>Model score: {paperScore}</p>
      </div>
    )
  }


  return (
    <Layout style={contentStyle}>
      <Alert closable message="In case of acceptance, we will display an email for any feedback on this project." type="info" style={{maxWidth: '40vw'}}/>
      <Content style={{marginTop: '20vh'}}>
          <Row justify="center">
            <div>
              <ul>
                <li key={1}>You can choose the best models on this website</li>
                <li key={2}>If you are a researcher, try to find methods that are already included.</li>
                <li key={3}>If you are a practitioner, try to find methods that work well on your own datasets.</li>
                <li key={4}>When the list is ready, tap the "Search" button and enjoy the list of recommendations.</li>
                <li key={5}>Type the models without spaces and capital letters</li>
              </ul>
            </div>
          </Row>
          <div style={{textAlign: 'center'}}><h1>Choose the best baselines for you RecSys experiments</h1></div>
          <Row justify="center">
            <Space>
              <SelectModels onChangeCallback={handleModels} />
              <Button
                size="large"
                onClick={handleSend}
                style={{maxWidth: '100px'}}
              >
                Search
              </Button>
            </Space>
          </Row>
          <Row style={{'marginTop': '19px'}}>
            <Col span={18} offset={3}>
              {
                (descriptions.length > 0) && <Text strong italic style={{'color': 'white'}}>RP3beta recommends to complete the list with the following list of models:</Text>
              }

              {
                descriptions.filter((d, i) => {
                  let d_score = parseFloat(d.score).toFixed(7);
                  return d_score > 0 && i <= 20;
                }).map((d, i) => {
                  let d_score = parseFloat(d.score).toFixed(7);
                  return getDescription(d.value, d.paper, d.year, d.url, d.abstract, d_score, i + 1);
                })
              }
            </Col>
          </Row>
      </Content>
    </Layout>
  );
};

export default App;
