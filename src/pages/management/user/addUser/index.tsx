import { Tabs, TabsProps } from 'antd';
import GeneralTab from './general-tab';




function UserAccount() {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <div className="flex items-center">
          <span>Add User</span>
        </div>
      ),
      children: <GeneralTab />,
    },
  ];

  return <Tabs defaultActiveKey="1" items={items} />;
}

export default UserAccount;
