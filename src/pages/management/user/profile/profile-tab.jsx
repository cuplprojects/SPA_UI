import React, { useState, useEffect } from 'react';
import { faker } from '@faker-js/faker';
import {
  Row,
  Col,
  Typography,
  Timeline,
  Table,
  Space,
  Avatar,
  Progress,
  Pagination,
  Select,
  App,
} from 'antd';
import { fakeAvatars } from '@/_mock/utils';
import Card from '@/components/card';
import { IconButton, Iconify, SvgIcon } from '@/components/icon';
import Scrollbar from '@/components/scrollbar';
import { useUserInfo } from '@/store/UserDataStore';
import ProTag from '@/theme/antd/components/tag';
import { useThemeToken } from '@/theme/hooks';
import useUserData from '@/CustomHooks/useUserData'; // Import the custom hook

const ProfileTab = () => {
  const { username } = useUserInfo();
  const theme = useThemeToken();
  const { userData, loading, error } = useUserData(); // Use the custom hook

  // Timeline pagination state
  const [timelineItems, setTimelineItems] = useState([]);
  const [timelinePage, setTimelinePage] = useState(1);
  const [timelineItemsPerPage, setTimelineItemsPerPage] = useState(2);

  // Table pagination state
  const [projectData, setProjectData] = useState([]);
  const [projectPage, setProjectPage] = useState(1);
  const [projectItemsPerPage, setProjectItemsPerPage] = useState(5);

  useEffect(() => {
    // Fetch or generate timeline items (simulate with faker)
    const fetchTimelineItems = () => {
      const items = [];
      for (let i = 0; i < 20; i++) {
        // Simulate more items
        items.push({
          color: theme.colorError,
          children: (
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <Typography.Text strong>{faker.lorem.sentence()}</Typography.Text>
                <div className="opacity-50">{faker.date.recent().toLocaleDateString()}</div>
              </div>
              <Typography.Text type="secondary" className="text-xs">
                {faker.lorem.paragraph()}
              </Typography.Text>

              <div className="mt-2 flex items-center gap-2">
                <SvgIcon icon="ic_file_pdf" size={30} />
                <span className="font-medium opacity-60">document.pdf</span>
              </div>
            </div>
          ),
        });
      }
      setTimelineItems(items);
    };

    fetchTimelineItems();
  }, [theme.colorError]);

  useEffect(() => {
    // Generate project data
    const fetchProjectData = () => {
      const data = [];
      for (let i = 0; i <= 15; i++) {
        // Simulate more project data
        data.push({
          key: faker.string.uuid(),
          avatar: faker.image.urlPicsumPhotos(),
          name: faker.company.buzzPhrase(),
          date: faker.date.past().toDateString(),
          leader: faker.person.fullName(),
          team: fakeAvatars(faker.number.int({ min: 2, max: 5 })),
          status: faker.number.int({ min: 50, max: 99 }),
        });
      }
      setProjectData(data);
    };

    fetchProjectData();
  }, [theme.colorPrimary]);

  // Pagination handlers
  const handleTimelinePageChange = (page) => {
    setTimelinePage(page);
  };

  const handleProjectPageChange = (page) => {
    setProjectPage(page);
  };

  const handleTimelineItemsPerPageChange = (value) => {
    setTimelineItemsPerPage(value);
    setTimelinePage(1); // Reset to the first page
  };

  const handleProjectItemsPerPageChange = (value) => {
    setProjectItemsPerPage(value);
    setProjectPage(1); // Reset to the first page
  };

  const AboutItems = [
    {
      icon: <Iconify icon="fa-solid:user" size={18} />,
      label: 'Full Name',
      val: userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...',
    },
    {
      icon: <Iconify icon="eos-icons:role-binding" size={18} />,
      label: 'Role',
      val: userData ? 'Developer' : 'Loading...',
    },
    {
      icon: <Iconify icon="ic:baseline-email" size={18} />,
      label: 'Email',
      val: userData ? userData.email : 'Loading...',
    },
  ];

  const TeamItems = [
    {
      avatar: <Iconify icon="devicon:react" size={36} />,
      name: 'React Developers',
      members: `${faker.number.int(100)} Members`,
      tag: <ProTag color="warning">Developer</ProTag>,
    },
    // More items here...
  ];

  const ProjectColumns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      render: (_, record) => (
        <div className="flex items-center">
          <img src={record.avatar} alt="" className="h-9 w-9 rounded-full" />
          <div className="ml-2 flex flex-col">
            <span className="font-semibold">{record.name}</span>
            <span className="text-xs opacity-50">{record.date}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'LEADER',
      dataIndex: 'leader',
      render: (val) => <span className="opacity-50">{val}</span>,
    },
    {
      title: 'TEAM',
      dataIndex: 'team',
      render: (val) => (
        <Avatar.Group>
          {val.map((item, index) => (
            <Avatar src={item} key={index} />
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      render: (val) => (
        <Progress percent={val} strokeColor={theme.colorPrimary} trailColor="transparent" />
      ),
    },
    {
      title: 'ACTIONS',
      dataIndex: 'action',
      render: () => (
        <Space size="middle">
          <IconButton>
            <Iconify icon="fontisto:more-v-a" />
          </IconButton>
        </Space>
      ),
    },
  ];

  const paginatedTimelineItems = timelineItems.slice(
    (timelinePage - 1) * timelineItemsPerPage,
    timelinePage * timelineItemsPerPage,
  );
  const paginatedProjectData = projectData.slice(
    (projectPage - 1) * projectItemsPerPage,
    projectPage * projectItemsPerPage,
  );

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={24} md={12} lg={8}>
          <Card className="flex-col">
            <div className="flex w-full flex-col">
              <Typography.Title level={5}>About</Typography.Title>
              <div className="mt-2 flex flex-col gap-4">
                {loading && <div>Loading...</div>}
                {error && <div>Error: {error}</div>}
                {!loading &&
                  !error &&
                  AboutItems.map((item, index) => (
                    <div className="flex" key={index}>
                      <div className="mr-2">{item.icon}</div>
                      <div className="mr-2">{item.label}:</div>
                      <div className="opacity-50">{item.val}</div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </Col>

        <Col span={24} md={12} lg={16}>
          <Card className="flex-col !items-start">
            <Typography.Title level={5}>Activity Timeline</Typography.Title>
            <Timeline className="!mt-4 w-full" items={paginatedTimelineItems} />
            <div className="mt-4 flex items-center justify-between">
              <Select
                value={timelineItemsPerPage}
                onChange={handleTimelineItemsPerPageChange}
                options={[
                  { label: '2', value: 2 },
                  { label: '5', value: 5 },
                  { label: '10', value: 10 },
                  { label: '15', value: 15 },
                ]}
                style={{ width: 120 }}
              />
              <Pagination
                current={timelinePage}
                pageSize={timelineItemsPerPage}
                total={timelineItems.length}
                onChange={handleTimelinePageChange}
                showSizeChanger={false}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col span={24}>
          <Card className="flex-col !items-start">
            <div className="mt-4 flex items-center justify-between">
              <Typography.Title level={5}>Projects</Typography.Title>
              <Select
                value={projectItemsPerPage}
                onChange={handleProjectItemsPerPageChange}
                options={[
                  { label: '5', value: 5 },
                  { label: '10', value: 10 },
                  { label: '15', value: 15 },
                ]}
                style={{ width: 120 }}
              />
            </div>
            <div className="!mt-4 w-full">
              <Scrollbar>
                <Table
                  columns={ProjectColumns}
                  dataSource={paginatedProjectData}
                  pagination={false}
                  bordered
                />
              </Scrollbar>

              <Pagination
                current={projectPage}
                pageSize={projectItemsPerPage}
                total={projectData.length}
                onChange={handleProjectPageChange}
                showSizeChanger={false}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProfileTab;
