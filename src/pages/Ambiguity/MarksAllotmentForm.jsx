import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Radio, Typography, Divider, Row, Col, Space, Table, Select, Button } from 'antd';
import { useProjectId } from '@/store/ProjectState';
import { useUserToken } from '@/store/UserDataStore';
import { useDatabase } from '@/store/DatabaseStore';

const { Title } = Typography;

const APIURL= import.meta.env.VITE_API_URL;

const MarksAllotmentForm = () => {
    const projectId = useProjectId()
    const token = useUserToken
    const database = useDatabase()

    const [formState, setFormState] = useState({
        numberOfAmbiguousQuestions: '',
        optionsJumbled: '',
        setCode: '',
        ambiguousQuestions: {},
        markingLogic: '',
    });

    const [setCodes, setSetCodes] = useState([]);
    const [markingRules, setMarkingRules] = useState([]);
    const [ambfetchdata, setAmbfetchdata] = useState([]);

    useEffect(() => {
        axios.get(`${APIURL}/Ambiguity/BSetResponsesByProject/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                const setCodesArray = response.data.split(',');
                setSetCodes(setCodesArray);
                if (setCodesArray.length > 0) {
                    setFormState(prevState => ({
                        ...prevState,
                        setCode: response.data
                    }));
                }
            })
            .catch(error => {
                console.error('Error fetching set codes:', error);
            });

        axios.get(`${APIURL}/Ambiguity/MarkingRule`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                setMarkingRules(response.data);
            })
            .catch(error => {
                console.error('Error fetching marking rules:', error);
            });
    }, []); 

    useEffect(() => {
        axios.get(`${APIURL}/Ambiguity/ByProjectId/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            const filteredData = response.data.map(item => ({
                ambiguousId: item.ambiguousId,
                projectId: item.projectId,
                markingId: item.markingId,
                setCode: item.setCode,
                questionNumber: item.questionNumber,
                option: item.option
            }));
            setAmbfetchdata(filteredData);
        })
        .catch(error => {
            console.error('Error fetching ambiguous data:', error);
        });
    }, [projectId, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState({
            ...formState,
            [name]: value
        });
    };

    const handleSelectChange = (name, value) => {
        setFormState({
            ...formState,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        const dataToSubmit = renderTableData().map(row => ({
            projectId,
            markingId: formState.markingLogic,
            setCode: row.setCode.split(' ')[1],
            questionNumber: row.questionNumber.props.value || null,
            option: row.option ? row.option.props.value || null : null
        }));

        try {
            const response = await axios.post(`${APIURL}/Ambiguity/allot-marks?WhichDatabase=${database}`, dataToSubmit, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Form submitted successfully:', response.data);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleDelete = async () => {
        try {
            // Assuming you want to delete all ambiguous questions
            await axios.delete(`${APIURL}/Ambiguity?WhichDatabase=${database}&ProjectId=${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAmbfetchdata([]);
            console.log('All items deleted successfully');
        } catch (error) {
            console.error('Error deleting items:', error);
        }
    };

    const handleQuestionChange = (setCode, questionNumber, e) => {
        const { value } = e.target;
        setFormState((prevState) => {
            const updatedQuestions = { ...prevState.ambiguousQuestions };
            if (!updatedQuestions[setCode]) {
                updatedQuestions[setCode] = {};
            }
            updatedQuestions[setCode][questionNumber] = {
                question: value,
                options: updatedQuestions[setCode][questionNumber] ? updatedQuestions[setCode][questionNumber].options : {}
            };
            return { ...prevState, ambiguousQuestions: updatedQuestions };
        });
    };

    const handleOptionChange = (setCode, questionNumber, option, e) => {
        const { value } = e.target;
        setFormState((prevState) => {
            const updatedQuestions = { ...prevState.ambiguousQuestions };

            if (formState.optionsJumbled === "No") {
                // If options are not jumbled, copy the same value to all sets for this question
                for (let i = 0; i < 4; i++) {
                    const currentSetCode = `Set ${String.fromCharCode(formState.setCode.charCodeAt(0) + i)}`;
                    if (!updatedQuestions[currentSetCode]) {
                        updatedQuestions[currentSetCode] = {};
                    }
                    if (!updatedQuestions[currentSetCode][questionNumber]) {
                        updatedQuestions[currentSetCode][questionNumber] = { options: {} };
                    }
                    updatedQuestions[currentSetCode][questionNumber].options[option] = value;
                }
            } else {
                // If options are jumbled, only update the specific set
                if (!updatedQuestions[setCode]) {
                    updatedQuestions[setCode] = {};
                }
                if (!updatedQuestions[setCode][questionNumber]) {
                    updatedQuestions[setCode][questionNumber] = { options: {} };
                }
                updatedQuestions[setCode][questionNumber].options[option] = value;
            }
            return { ...prevState, ambiguousQuestions: updatedQuestions };
        });
    };

    const renderTableData = () => {
        const { numberOfAmbiguousQuestions, setCode, markingLogic } = formState;
        const data = [];

        if (numberOfAmbiguousQuestions && !isNaN(numberOfAmbiguousQuestions) && setCode) {
            for (let i = 1; i <= parseInt(numberOfAmbiguousQuestions); i++) {
                // For each question, create 4 rows with consecutive letters starting from setCode
                for (let j = 0; j < 4; j++) {
                    const currentSetLetter = String.fromCharCode(setCode.charCodeAt(0) + j);
                    const isDisabled = formState.optionsJumbled === "No" && j > 0;
                    const questionNumberInput = (
                        <Input
                            type="number"
                            placeholder={`Question ${i}`}
                            value={formState.ambiguousQuestions[`Set ${currentSetLetter}`] && formState.ambiguousQuestions[`Set ${currentSetLetter}`][i] && formState.ambiguousQuestions[`Set ${currentSetLetter}`][i].question}
                            onChange={(e) => handleQuestionChange(`Set ${currentSetLetter}`, i, e)}
                            style={{ borderRadius: '0' }}
                        />
                    );

                    const optionInput = (
                        <Input
                            type="text"
                            placeholder={`Option for Question ${i}`}
                            value={formState.ambiguousQuestions[`Set ${currentSetLetter}`] && formState.ambiguousQuestions[`Set ${currentSetLetter}`][i] && formState.ambiguousQuestions[`Set ${currentSetLetter}`][i].options && formState.ambiguousQuestions[`Set ${currentSetLetter}`][i].options['option']}
                            onChange={(e) => handleOptionChange(`Set ${currentSetLetter}`, i, 'option', e)}
                            style={{ borderRadius: '0' }}
                            disabled={isDisabled}
                        />
                    );

                    data.push({
                        key: `${i}-${j}`,
                        setCode: `Set ${currentSetLetter}`,
                        questionNumber: questionNumberInput,
                        ...(markingLogic && markingRules.slice(0, 3).some(rule => rule.markingId === markingLogic) ? {} : { option: optionInput })
                    });
                }
            }
        }

        return data;
    };

    const columns = [
        {
            title: 'Set Code',
            dataIndex: 'setCode',
            key: 'setCode',
        },
        {
            title: 'Question Number',
            dataIndex: 'questionNumber',
            key: 'questionNumber',
        },
        ...(markingRules.slice(0, 3).some(rule => rule.markingId === formState.markingLogic) ? [] : [{
            title: 'Option',
            dataIndex: 'option',
            key: 'option',
        }]),
    ];

    return (
        <Form layout="vertical" style={{ maxWidth: '2000px', margin: '50px auto 0 auto' }}>
            <Row gutter={5}>
                <Col span={6}>
                    <Form.Item label="Number of ambiguous questions" className='me-5'>
                        <Input
                            type="number"
                            name="numberOfAmbiguousQuestions"
                            value={formState.numberOfAmbiguousQuestions}
                            onChange={handleChange}
                            style={{ borderRadius: '0' }}
                            placeholder=''
                        />
                    </Form.Item>
                </Col>

                <Col span={6}>
                    <Form.Item label={<span style={{ fontWeight: 'bold', color: '#ff0000' }}>Set Code</span>}>
                        <Input
                            name="setCode"
                            value={formState.setCode}
                            onChange={handleChange}
                            style={{ borderRadius: '0' }}
                            pattern="[A-Za-z]"
                            maxLength={1}
                            placeholder="Enter a single alphabet"
                        />
                    </Form.Item>
                </Col>
                <Col className="d-flex justify-content-center" span={6}>
                    <Form.Item label="Options Jumbled?">
                        <Radio.Group
                            name="optionsJumbled"
                            value={formState.optionsJumbled}
                            onChange={handleChange}
                        >
                            <Space>
                                <Radio value="Yes">Yes</Radio>
                                <Radio value="No">No</Radio>
                            </Space>
                        </Radio.Group>
                    </Form.Item>
                </Col>
                <Col span={10}>
                    <Form.Item label="Marking Logic">
                        <Select
                            name="markingLogic"
                            value={formState.markingLogic}
                            onChange={value => handleSelectChange('markingLogic', value)}
                            style={{ width: '100%' }}
                        >
                            {markingRules.map(rule => (
                                <Select.Option key={rule.markingId} value={rule.markingId}>
                                    {rule.markingName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider />
            <Row gutter={16}>
                <Col span={24}>
                    <Table
                        columns={columns}
                        dataSource={renderTableData()}
                        pagination={false}
                        bordered={true}
                    />
                </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
                <Col span={24}>
                    <Table
                        columns={[
                            { title: 'Set Code', dataIndex: 'setCode', key: 'setCode' },
                            { title: 'Question Number', dataIndex: 'questionNumber', key: 'questionNumber' },
                            { title: 'Option', dataIndex: 'option', key: 'option' },
                        ]}
                        dataSource={ambfetchdata}
                        pagination={false}
                        bordered={true}
                    />
                </Col>
            </Row>
            <Form.Item style={{ marginTop: '20px' }}>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
                <Button
                    type="danger"
                    onClick={handleDelete}
                    style={{ marginLeft: '10px' }}
                >
                    Delete All
                </Button>
            </Form.Item>
        </Form>
    );
};

export default MarksAllotmentForm;
