import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FieldConfig.css';
import { Button, Table, Input, Select, Space, Popconfirm, notification, Tooltip, Modal } from 'antd';
import { DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import { useThemeToken } from '@/theme/hooks';
import { Col, Row } from 'react-bootstrap';
import { useProjectId } from '@/store/ProjectState';
import { usePreferredResponse } from '@/utils/PreferredResponse/PreferredResponseContext';
import { handleDecrypt, handleEncrypt } from '@/Security/Security';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';

const APIURL = import.meta.env.VITE_API_URL;
const { Option } = Select;

const FieldConfiguration = () => {
  const { colorPrimary } = useThemeToken();
  const [isFormVisible, setFormVisible] = useState(false);
  const { fetchPreferredResponse } = usePreferredResponse();
  const [formData, setFormData] = useState({
    minRange: '',
    maxRange: '',
    responses: '',
    numberOfBlocks: '',
    canBlank: false,
  });
  const [fieldName, setFieldName] = useState(''); // New state for fieldName
  const [savedData, setSavedData] = useState([]);
  const [fields, setFields] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(-1);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30', '50'],
  });
  const [rangeError, setRangeError] = useState(false);
  const ProjectId = useProjectId();
  const database = useDatabase();
  const token = useUserToken();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFields();
  }, []);

  useEffect(() => {
    getFieldConfig();
  }, []);

  const getFieldConfig = async () => {
    axios
      .get(`${APIURL}/FieldConfigurations/GetByProjectId/${ProjectId}?WhichDatabase=${database}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        let decryptedData = handleDecrypt(response.data);
        console.log(decryptedData);
        let Jsondata = JSON.parse(decryptedData);
        console.log(Jsondata);
        setSavedData(Jsondata);
        setPagination({ ...pagination, total: Jsondata.length });
      })
      .catch((error) => {
        console.error('Error fetching field configurations:', error);
      });
  };

  console.log(savedData);
  const getFields = () => {
    axios
      .get(`${APIURL}/Fields?WhichDatabase=${database}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setFields(response.data);
      })
      .catch((error) => {
        console.error('Error fetching fields:', error);
      });
  };

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  const handleInputChange = (e) => {
    const { id, type, value, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [id]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  useEffect(() => {
    const minRangeInt = parseInt(formData.minRange, 10);
    const maxRangeInt = parseInt(formData.maxRange, 10);

    if (minRangeInt > maxRangeInt) {
      setRangeError(true);
    } else {
      setRangeError(false);
    }
  }, [formData.minRange, formData.maxRange]);

  const handleSave = (e) => {
    setLoading(true);
    e.preventDefault();

    if (!fieldName || !formData.numberOfBlocks) {
      notification.error({
        message: 'Please fill in all fields!',
        duration: 3,
      });
      setLoading(false)
      return;
    }

    if (parseInt(formData.minRange) > parseInt(formData.maxRange)) {
      notification.error({
        message: 'Maximum range cannot be less than minimum range!',
        duration: 3,
      });
      setLoading(false)
      return;
    }

    if (formData.maxRange) {
      if (formData.numberOfBlocks !== formData.maxRange.toString().length.toString()) {
        notification.error({
          message: 'Number of blocks must match the length of the max range!',
          duration: 3,
        });
        setLoading(false)
        return;
      }
    }

    const newConfig = {
      FieldConfigurationId:
        selectedFieldIndex !== -1 ? savedData[selectedFieldIndex].FieldConfigurationId : 0,
      projectId: ProjectId,
      fieldName: fieldName, // Add fieldName here
      fieldAttributesJson: '',
      canBlank: formData.canBlank,
      fieldAttributes: [
        {
          minRange: formData.minRange,
          maxRange: formData.maxRange,
          responses: formData.responses,
          numberOfBlocks: formData.numberOfBlocks.toString(),
        },
      ],
    };

   

    let newConfigJson = JSON.stringify(newConfig);
    let encrypteddata = handleEncrypt(newConfigJson);

    const encrypteddatatosend = {
      cyphertextt: encrypteddata,
    };

    if (selectedFieldIndex !== -1) {
      axios
        .put(
          `${APIURL}/FieldConfigurations/${newConfig.FieldConfigurationId}?WhichDatabase=${database}`,
          encrypteddatatosend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then(async (response) => {
          getFieldConfig();
          setLoading(false);
          notification.success({
            message: 'Field configuration updated successfully!',
            duration: 3,
          });


          
          // Check if flags exist for the project
          const flagsExistResponse = await axios.get(
            `${APIURL}/Flags/FlagExist?id=${ProjectId}&WhichDatabase=${database}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          console.log(flagsExistResponse.data)
          if (flagsExistResponse.data.status === true) {
            Modal.confirm({
              title: 'Run Audit',
              content: 'Would you like to run an audit after this configuration change?',
              okText: 'Yes, Run Audit',
              cancelText: 'No',
              onOk: async () => {
                try {
                  // Delete existing flags
                  await axios.delete(
                    `${APIURL}/Flags/DeleteforNewAudit?id=${newConfig.FieldConfigurationId}&WhichDatabase=${database}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    }
                  );

                  // Run the audit
                  const response = await axios.get(
                    `${APIURL}/Audit/RangeAudit?WhichDatabase=${database}&ProjectId=${ProjectId}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    }
                  );
                  notification.success({
                    message: 'Audit Completed Successfully',
                    duration: 3,
                  });
                } catch (error) {
                  notification.error({
                    message: error.message,
                    description: 'Failed to run the audit. Please try again.',
                    duration: 3,
                  });
                }
              }
            });
          }
        })
        .catch((error) => {
          setLoading(false);
          console.error('Error updating field configuration:', error);
          notification.error({
            message: 'Error updating field configuration. Please try again later!',
            duration: 3,
          });
        });
        
    } else {
      axios
        .post(`${APIURL}/FieldConfigurations?WhichDatabase=${database}`, encrypteddatatosend, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const newFieldConfig = response.data;
          getFieldConfig();
          setLoading(false);
          notification.success({
            message: 'Field configuration saved successfully.',
            duration: 3,
          });
          setPagination({ ...pagination, total: savedData.length + 1 });
        })
        .catch((error) => {
          setLoading(false);
          console.error('Error saving field configuration:', error);
          notification.error({
            message: 'Error saving field configuration. Please try again later.',
            duration: 3,
          });
          if (error.response) {
            console.error('Response data:', error.response.data);
          }
        });
    }

    setFormData({
      minRange: '',
      maxRange: '',
      responses: '',
      numberOfBlocks: '',
      canBlank: false,
    });
    setFieldName(''); // Reset fieldName
  };

  useEffect(() => {
    if (savedData.length > 0) {
      const savedFieldNames = savedData.map((item) => item.FieldName);
      const filteredFields = fields.filter((field) => !savedFieldNames.includes(field.fieldName));
      setFields(filteredFields);
    }
  }, [savedData]);

  const handleDelete = (FieldConfigurationId) => {
    axios
      .delete(`${APIURL}/FieldConfigurations/${FieldConfigurationId}?WhichDatabase=${database}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setSavedData(
          savedData.filter((item) => item.FieldConfigurationId !== FieldConfigurationId),
        );
        notification.success({
          message: 'Field configuration deleted successfully.',
          duration: 3,
        });
      })
      .catch((error) => {
        console.error('Error deleting field configuration:', error);
        notification.success({
          message: 'Error deleting field configuration. Please try again later.',
          duration: 3,
        });
      });
  };

  const handleFieldSelection = (record, rowIndex) => {
    setFormVisible(true);
    setSelectedFieldIndex(rowIndex);
    setFormData({
      minRange: record.FieldAttributes[0].MinRange,
      maxRange: record.FieldAttributes[0].MaxRange,
      responses: record.FieldAttributes[0].Responses,
      numberOfBlocks: record.FieldAttributes[0].NumberOfBlocks,
    });
    setFieldName(record.FieldName); // Set the fieldName state
  };

  // get autofill data
  const getAutofillData = async (fieldName) => {
    const preferredResponse = await fetchPreferredResponse(fieldName);
    if (preferredResponse) {
      setFormData((prevData) => ({
        ...prevData,
        responses: preferredResponse || '',
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        responses: '',
      }));
    }
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);

    setTimeout(() => {
      setAlertMessage('');
      setAlertType('');
    }, 3000);
  };

  const columns = [
    {
      title: 'Field',
      dataIndex: 'FieldName',
      key: 'fieldName',
      sorter: (a, b) => a.FieldName.localeCompare(b.FieldName),
    },
    {
      title: 'Min Range',
      dataIndex: ['FieldAttributes', 0, 'MinRange'],
      key: 'minRange',
      sorter: (a, b) => {
        const minRangeA = parseInt(a.FieldAttributes[0].MinRange, 10);
        const minRangeB = parseInt(b.FieldAttributes[0].MinRange, 10);
        return minRangeA - minRangeB;
      },
    },
    {
      title: 'Max Range',
      dataIndex: ['FieldAttributes', 0, 'MaxRange'],
      key: 'maxRange',
      sorter: (a, b) => {
        const maxRangeA = parseInt(a.FieldAttributes[0].MaxRange, 10);
        const maxRangeB = parseInt(b.FieldAttributes[0].MaxRange, 10);
        return maxRangeA - maxRangeB;
      },
    },
    {
      title: 'Preferred Responses',
      dataIndex: ['FieldAttributes', 0, 'Responses'],
      key: 'responses',
      sorter: (a, b) =>
        a.FieldAttributes[0].Responses.localeCompare(b.FieldAttributes[0].Responses),
    },
    {
      title: 'Number of Blocks',
      dataIndex: ['FieldAttributes', 0, 'NumberOfBlocks'],
      key: 'numberOfBlocks',
      sorter: (a, b) => {
        const blocksA = parseInt(a.FieldAttributes[0].NumberOfBlocks, 10);
        const blocksB = parseInt(b.FieldAttributes[0].NumberOfBlocks, 10);
        return blocksA - blocksB;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record, index) => (
        <Space>
          <Button type="link" onClick={() => handleFieldSelection(record, index)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure delete this configuration?"
            onConfirm={() => handleDelete(record.FieldConfigurationId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="field-configuration">
      <Button
        type="primary"
        onClick={toggleFormVisibility}
        style={{ marginBottom: 16, backgroundColor: colorPrimary }}
      >
        {isFormVisible ? 'Hide Form' : 'Add New Configuration'}
      </Button>
      {alertMessage && (
        <div className={`alert alert-${alertType}`} role="alert">
          {alertMessage}
        </div>
      )}
      {isFormVisible && (
        <form onSubmit={handleSave} className="config-form mb-2 rounded border p-2">
          <Row>
            <Col xs={12} md={6}>
              <label htmlFor="field">Field:</label>
              <Select
                id="field"
                value={fieldName}
                onChange={setFieldName}
                style={{ width: '100%' }}
              >
                {fields.map((field) => (
                  <Option key={field.fieldName} value={field.fieldName}>
                    {field.fieldName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={6}>
              <label htmlFor="minRange">Min Range:</label>
              <Input
                type="number"
                id="minRange"
                value={formData.minRange}
                onChange={handleInputChange}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6}>
              <label htmlFor="maxRange">Max Range:</label>
              <Input
                type="number"
                id="maxRange"
                value={formData.maxRange}
                onChange={handleInputChange}
              />
            </Col>
            <Col xs={12} md={6}>
              <label htmlFor="responses">Preferred Responses:</label>
              <Input
                id="responses"
                value={formData.responses}
                onChange={handleInputChange}
                suffix={
                  <Tooltip title="Autofill by registered data">
                    <span className="c-pointer" onClick={() => getAutofillData(fieldName)}>
                      <RedoOutlined style={{ fontSize: '16px', color: colorPrimary }} />
                    </span>
                  </Tooltip>
                }
              />
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col xs={12} md={6}>
              <label htmlFor="numberOfBlocks">Number of Blocks:</label>
              <Input
                type="number"
                id="numberOfBlocks"
                value={formData.numberOfBlocks}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={12} md={6}>
              <Row>
                <Col xs={12} md={6}>
                  <label
                    htmlFor="canBlank"
                    className="d-inline-block mb-0 me-2"
                    style={{ verticalAlign: 'middle' }}
                  >
                    Can Be Blank:
                  </label>
                </Col>
                <Col xs={12} md={6} className="text-start">
                  <Input
                    type="checkbox"
                    id="canBlank"
                    checked={formData.canBlank}
                    onChange={handleInputChange}
                    style={{ marginLeft: '8px' }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <div className="m-3 text-center">
            <Button className="px-3" type="primary" htmlType="submit" disabled={loading}>
              Save
            </Button>
          </div>
        </form>
      )}
      <Table
        bordered
        columns={columns}
        dataSource={savedData}
        rowKey="fieldConfigurationId"
        pagination={pagination}
        onChange={(pag) => setPagination(pag)}
      />
    </div>
  );
};

export default FieldConfiguration;
