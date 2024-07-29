// D:\shivom\SPA\slash-admin\src\pages\components\profile\Profile.tsx

import React from 'react';
import { Card, Avatar, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { DEFAULT_USER } from '@/_mock/assets';

const Profile: React.FC = () => {
  const user = DEFAULT_USER     ;

  return (
    <Card style={{ maxWidth: 600, margin: '0 auto', marginTop: 20 }}>
      <Card.Meta
        avatar={<Avatar icon={<UserOutlined />} src={user.avatar} />}
        title={user.username}
        description={user.email}
      />
      <Descriptions bordered column={1} style={{ marginTop: 20 }}>
        <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Role">{user.role.name}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default Profile;
