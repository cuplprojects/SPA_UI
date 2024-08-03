import React, { useEffect, useState } from 'react';
import { Table, notification, Badge, Button, Popconfirm } from 'antd';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import Icon from '@ant-design/icons/lib/components/Icon';
import axios from 'axios';
import { DeleteOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { handleDecrypt } from '@/Security/Security';
import { d } from '@/Security/ParamSecurity';
import { useUserToken } from '@/store/UserDataStore';

const apiurl = import.meta.env.VITE_API_URL;

const columns = [
  {
    title: 'Roll Number',
    dataIndex: 'roll',
    sorter: {
      compare: (a, b) => a.roll - b.roll,
    },
  },
  {
    title: 'Course',
    dataIndex: 'course',
    sorter: {
      compare: (a, b) => a.course - b.course,
    },
  },
  {
    title: 'Total Score',
    dataIndex: 'totalScore',
    sorter: {
      compare: (a, b) => a.totalScore - b.totalScore,
    },
  },
];

const expandedRowRender = (record) => {
  const nestedColumns = [
    {
      title: 'Section Name',
      dataIndex: 'sectionName',
      key: 'sectionName',
    },
    {
      title: 'Total Correct Answers',
      dataIndex: 'totalCorrectAnswers',
      key: 'totalCorrectAnswers',
    },
    {
      title: 'Total Wrong Answers',
      dataIndex: 'totalWrongAnswers',
      key: 'totalWrongAnswers',
    },
    {
      title: 'Total Score Sub',
      dataIndex: 'totalScoreSub',
      key: 'totalScoreSub',
    },
  ];

  const nestedData = record.sectionResult.map((section, index) => ({
    key: index, // Assuming 'key' is unique within section results
    sectionName: section.sectionName,
    totalCorrectAnswers: section.totalCorrectAnswers,
    totalWrongAnswers: section.totalWrongAnswers,
    totalScoreSub: section.totalScoreSub,
  }));
  return <Table columns={nestedColumns} dataSource={nestedData} pagination={false} />;
};

const ViewScore = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const ProjectId = useProjectId();
  const database = useDatabase();
  const { course } = useParams();
  const [courseName, setCourseName] = useState();
  const token = useUserToken();

  useEffect(() => {
    if (course) {
      const decryptCourse = d(course);
      setCourseName(decryptCourse);
    }
  }, [course]);

  useEffect(() => {
    fetchData();
  }, [courseName]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${apiurl}/Score?WhichDatabase=${database}&ProjectId=${ProjectId}&courseName=${encodeURIComponent(
          courseName,
        )}`,{
        headers: {
          Authorization: `Bearer ${token}`
      }
    });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      const transformedData = result.map((item) => ({
        roll: item.rollNumber,
        course: item.courseName,
        correctScore: item.scoreData,
        totalScore: item.totalScore,
        sectionResult: item.sectionResult,
      }));

      setData(transformedData);
      setLoading(false);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch scores!',
        duration: 3,
      });
      setLoading(false);
    }
  };

  const handleDeleteScore = async (courseName) => {
    try {
      const response = await axios.delete(
        `${apiurl}/Score?WhichDatabase=${database}&ProjectId=${ProjectId}&CourseName=${courseName}`,
        { headers: {
          Authorization: `Bearer ${token}`
      }},
      );
      fetchData();
      notification.success({
        message: 'Score data deleted',
        duartion: 3,
      });
      // Handle the response here
      console.log('Deletion successful:', response.data);
    } catch (error) {
      notification.error({
        message: 'Error in deleting Score',
        duartion: 3,
      });
      // Handle errors here
      notification.error({
        message: 'Error in deleting Score',
        duartion: 3,
      });
      console.error(
        'Error deleting score data:',
        error.response ? error.response.data : error.message,
      );
    }
  };

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="mb-2 text-end">
        <Popconfirm
          title="Are you sure you want to delete all scores?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => handleDeleteScore(courseName)}
        >
          <Button
            danger
            icon={<DeleteOutlined />} // Use DeleteOutlined icon if needed
          >
            Delete Score
          </Button>
        </Popconfirm>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        onChange={onChange}
        expandable={{
          expandedRowRender,
        }}
        rowKey="roll"
      />
    </>
  );
};

export default ViewScore;
