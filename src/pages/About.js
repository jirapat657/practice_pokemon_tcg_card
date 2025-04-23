import React from 'react';
import { Button, Tooltip, Row, Col } from 'antd';
import { SearchOutlined, RollbackOutlined } from '@ant-design/icons';

function About() {
  return (
    <div>
      <h1>เกี่ยวกับ</h1>
      <p>หน้านี้เป็นข้อมูลเกี่ยวกับเว็บไซต์</p>
      <Row gutter={[8, 8]} wrap>
        <Col>
            <Tooltip title="search">
            <Button type="primary" shape="circle" icon={<SearchOutlined />} />
            </Tooltip>
        </Col>
        <Col>
            <Button type="primary" shape="circle">A</Button>
        </Col>
        <Col>
            <Button type="primary" icon={<SearchOutlined />}>Search</Button>
        </Col>
        </Row>
        <RollbackOutlined />
     
    </div>
  );
}

export default About;
