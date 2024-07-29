import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Radio, Typography, Divider, Row, Col, Space, Table, Select, Button } from 'antd';
import { useProjectId } from '@/store/ProjectState';

const { Title } = Typography;


const apiurl = import.meta.env.VITE_API_URL;


const MarksAllotmentForm = () => {
    const projectId = useProjectId()
    const [formState, setFormState] = useState({
        numberOfAmbiguousQuestions: '',
        optionsJumbled: '',
        setCode: '',
        ambiguousQuestions: {},
        markingLogic: '', // New state to store the selected marking logic
    });

    const [setCodes, setSetCodes] = useState([]);
    const [markingRules, setMarkingRules] = useState([]);


    useEffect(() => {
        axios.get('http://localhost:5071/api/Ambiguity/BSetResponsesByProject/1')
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

        axios.get('http://localhost:5071/api/MarkingRule')
            .then(response => {
                setMarkingRules(response.data);
            })
            .catch(error => {
                console.error('Error fetching marking rules:', error);
            });
    }, []);


    useEffect(() => {
        axios.get(`${apiurl}/Ambiguity/BSetResponsesByProject/${projectId}`)
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

        axios.get(`${apiurl}/MarkingRule`)
            .then(response => {
                setMarkingRules(response.data);
            })
            .catch(error => {
                console.error('Error fetching marking rules:', error);
            });
    }, []);


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


    const transformData = () => {
        const transformed = [];

        Object.keys(formState.ambiguousQuestions).forEach(setCode => {
            Object.keys(formState.ambiguousQuestions[setCode]).forEach(questionNumber => {
                const questionData = formState.ambiguousQuestions[setCode][questionNumber];


                if (questionData && questionData.options) {
                    const optionsKey = Object.keys(questionData.options)[0];
                    const optionValue = questionData.options[optionsKey];

                    transformed.push({
                        Set: setCode,
                        Question: questionNumber,
                        Option: optionValue
                    });
                }
            });
        });

        return transformed;

    };

    const handleSubmit = async () => {
        const requestData = {
            projectId, // Update this as per your requirement
            markingId: formState.markingLogic,
            setQuesAns: JSON.stringify(transformData()) // Convert to JSON string
        };

        try {
            const response = await axios.post('http://localhost:5071/api/Ambiguity/allot-marks', requestData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Form submitted successfully:', response.data);
        } catch (error) {
            console.error('Error submitting form:', error);
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
                // Iterate over setCodes array directly
                setCodes.forEach(code => {
                    if (!updatedQuestions[code]) {
                        updatedQuestions[code] = {};
                    }
                    if (!updatedQuestions[code][questionNumber]) {
                        updatedQuestions[code][questionNumber] = { options: {} };
                    }
                    updatedQuestions[code][questionNumber].options[option] = value;
                });
            } else {
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
        const { numberOfAmbiguousQuestions } = formState;
        const data = [];

        if (numberOfAmbiguousQuestions && !isNaN(numberOfAmbiguousQuestions)) {
            for (let i = 1; i <= parseInt(numberOfAmbiguousQuestions); i++) {
                setCodes.forEach(setCode => {
                    data.push({
                        key: `${setCode}-${i}`,
                        setCode: setCode,
                        questionNumber: (
                            <Input
                                type="number"
                                placeholder={`Question ${i}`}
                                value={formState.ambiguousQuestions[setCode] && formState.ambiguousQuestions[setCode][i] && formState.ambiguousQuestions[setCode][i].question}
                                onChange={(e) => handleQuestionChange(setCode, i, e)}
                                style={{ borderRadius: '0' }}
                            />
                        ),
                        option: (
                            <Input
                                type="text"
                                placeholder={`Option for Question ${i}`}
                                value={formState.ambiguousQuestions[setCode] && formState.ambiguousQuestions[setCode][i] && formState.ambiguousQuestions[setCode][i].options && formState.ambiguousQuestions[setCode][i].options['option']}
                                onChange={(e) => handleOptionChange(setCode, i, 'option', e)}
                                style={{ borderRadius: '0' }}
                            />
                        )
                    });
                });
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
        {
            title: 'Option',
            dataIndex: 'option',
            key: 'option',
        },

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
                            value={formState.setCode}
                            disabled
                            style={{ borderRadius: '0' }}
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
                    />
                </Col>
            </Row>
            <Form.Item>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </Form.Item>

        </Form>
    );
};

export default MarksAllotmentForm;
