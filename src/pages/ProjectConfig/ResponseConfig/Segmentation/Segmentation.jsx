import React, { useEffect, useState } from 'react';
import { Select, Checkbox, Form, Button, Input, InputNumber, Radio, Divider,notification } from 'antd';
import { useProjectId } from '@/store/ProjectState';
import ResponseConfig from '../Response/ResponseConfig';
import { Col, Row } from 'react-bootstrap';
import { useDatabase } from '@/store/DatabaseStore';
import { handleEncrypt } from '@/Security/Security';
import axios from 'axios';

const { Option } = Select;

const Segmentation = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [hasSections, setHasSections] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState('');
  const [questionFrom, setQuestionFrom] = useState('');
  const [questionTo, setQuestionTo] = useState('');
  const [marksPerQuestion, setMarksPerQuestion] = useState('');
  const [sections, setSections] = useState([]);
  const [negativeMarking, setNegativeMarking] = useState('no');
  const [marksForCorrectOption, setMarksForCorrectOption] = useState('');
  const [courseOptions, setCourseOptions] = useState([]);
  const projectId = useProjectId();
  const [responseOption, setResponseOption] = useState('ABC');
  const [numBlocks, setNumBlocks] = useState(4); // State for selected response option
  const database = useDatabase();


  const APIURL = import.meta.env.VITE_API_URL;

  const handleCourseChange = (value) => {
    setSelectedCourse(value);
  };

  const handleCheckboxChange = (e) => {
    setHasSections(e.target.checked);
    if (!e.target.checked) {
      // Reset sections if checkbox is unchecked
      setSections([]);
    }
  };

  const handleAddSection = () => {
    // Added negativeMarking and marksForWrongAnswer to each section
    setSections([
      ...sections,
      {
        name: '',
        totalQuestions: '',
        questionFrom: '',
        questionTo: '',
        marksPerQuestion: '',
        negativeMarking: 'no', // Added field for negative marking
        marksForWrongAnswer: '', // Added field for marks for wrong answer
      },
    ]);
  };

  const handleRemoveSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = sections.map((section, i) =>
      i === index ? { ...section, [field]: value } : section,
    );
    setSections(updatedSections);
  };

  const calculateTotalMarks = (marksPerQuestion, totalQuestions) => {
    if (marksPerQuestion && totalQuestions) {
      return totalQuestions * marksPerQuestion;
    }
    return 0;
  };
  const handleResponseOptionChange = (e) => {
    setResponseOption(e.target.value);
  };

  const handleNumBlocksChange = (e) => {
    setNumBlocks(parseInt(e.target.value));
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `${APIURL}/Registration/GetUniqueValues?whichDatabase=${database}&key=Course%20Name&ProjectId=${projectId}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log(result);
        setCourseOptions(result); // Adjust based on actual API response structure
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [projectId]);

  // Function that needs to be async
  useEffect(() => {
    if (!hasSections) {
      setSections([
        {
          name: '',
          totalQuestions,
          questionFrom,
          questionTo,
          marksPerQuestion,
          negativeMarking, // Added field for negative marking
          marksForWrongAnswer: marksForCorrectOption,
        },
      ]);
    }
  }, [
    totalQuestions,
    questionFrom,
    questionTo,
    marksPerQuestion,
    negativeMarking,
    marksForCorrectOption,
  ]);

  // Function that needs to be async
  const submitData = async () => {
    try {
      // Ensure numBlocks is defined or set a default value

      // Prepare data to match API expected structure
      const dataToSubmit = {
        responseId: 0, // Adjust this as needed
        sectionsJson: '', // Assuming this is not used; set as needed
        sections: sections.map((section) => ({
          name: section.name || '',
          numQuestions: section.totalQuestions || 0,
          marksCorrect: section.marksPerQuestion || 0,
          startQuestion: section.questionFrom || 0,
          endQuestion: section.questionTo || 0,
          negativeMarking: section.negativeMarking === 'yes', // Convert to boolean
          marksWrong: section.negativeMarking === 'yes' ? section.marksForWrongAnswer || 0 : 0,
          totalMarks: calculateTotalMarks(section.marksPerQuestion, section.totalQuestions),
        })),
        responseOption: responseOption || '',
        numberOfBlocks: numBlocks,
        projectId: projectId || 0,
        courseName: selectedCourse || '',
      };

      // Log the data to ensure it's formatted correctly
      // console.log('Data to submit:', JSON.stringify(dataToSubmit));
      const encryptedDatatosubmit = {
        cyphertextt: handleEncrypt(JSON.stringify(dataToSubmit))
      };

      // Perform the API request
      const response = await axios.post(
        `${APIURL}/ResponseConfigs?WhichDatabase=${database}`,
        encryptedDatatosubmit,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
        
      );
      notification.success({
        message:'Submitted Response configuration',
        duration:3,
      })

      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      // const result = await response.json();
      // console.log(result);
    } catch (error) {
      console.error(error);
      notification.error({
        message:'Error submitting response configuration. Please try again later.',
        duration:3,
      })
    }
  };

  return (
    <Form layout="vertical" onFinish={submitData}>
      <Row>
        <Col>
          <Form.Item label="Select Course">
            {courseOptions && courseOptions.length > 0 ? (
              <Select
                placeholder="Select a course"
                onChange={handleCourseChange}
                value={selectedCourse}
              >
                {courseOptions.map((course, index) => (
                  <Option key={index} value={course}>
                    {course}
                  </Option>
                ))}
              </Select>
            ) : (
              <Input
                placeholder="Enter Course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              />
            )}
          </Form.Item>
        </Col>
        <Col>
          {selectedCourse && (
            <Form.Item>
              <Checkbox checked={hasSections} onChange={handleCheckboxChange}>
                Does this course have sections?
              </Checkbox>
            </Form.Item>
          )}
        </Col>
      </Row>

      {hasSections ? (
        <>
          {sections.map((section, index) => (
            <div key={index}>
              <Divider orientation="left">Section {index + 1}</Divider>

              <Row>
                <Col>
                  <Form.Item label="Section Name">
                    <Input
                      value={section.name}
                      onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item label="Total Questions">
                    <InputNumber
                      min={1}
                      value={section.totalQuestions}
                      onChange={(value) => handleSectionChange(index, 'totalQuestions', value)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Item label="Question From">
                    <Input
                      value={section.questionFrom}
                      onChange={(e) => handleSectionChange(index, 'questionFrom', e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item label="Question To">
                    <Input
                      value={section.questionTo}
                      onChange={(e) => handleSectionChange(index, 'questionTo', e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Item label="Marks Per Correct Question">
                    <InputNumber
                      min={0}
                      value={section.marksPerQuestion}
                      onChange={(value) => handleSectionChange(index, 'marksPerQuestion', value)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item label="Is there negative marking?">
                    <Radio.Group
                      onChange={(e) =>
                        handleSectionChange(index, 'negativeMarking', e.target.value)
                      }
                      value={section.negativeMarking}
                    >
                      <Radio value="yes">Yes</Radio>
                      <Radio value="no">No</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Item label="Total Marks">
                    <Input
                      readOnly
                      value={calculateTotalMarks(section.marksPerQuestion, section.totalQuestions)}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  {section.negativeMarking === 'yes' && (
                    <Form.Item label="Marks for Wrong Answer">
                      <InputNumber
                        min={0}
                        value={section.marksForWrongAnswer}
                        onChange={(value) =>
                          handleSectionChange(index, 'marksForWrongAnswer', value)
                        }
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Form.Item>
                <Button type="dashed" onClick={() => handleRemoveSection(index)}>
                  Remove Section
                </Button>
              </Form.Item>
            </div>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={handleAddSection}>
              Add Section
            </Button>
          </Form.Item>
        </>
      ) : (
        !hasSections &&
        selectedCourse && (
          <>
            <Row>
              <Col>
                <Form.Item label="Total Questions">
                  <InputNumber
                    min={1}
                    onChange={(value) => setTotalQuestions(value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="Marks Per Correct Question">
                  <InputNumber
                    min={0}
                    onChange={(value) => setMarksPerQuestion(value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Item label="Question From">
                  <Input onChange={(e) => setQuestionFrom(e.target.value)} />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="Question To">
                  <Input onChange={(e) => setQuestionTo(e.target.value)} />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Item label="Is there negative marking?">
                  <Radio.Group
                    onChange={(e) => setNegativeMarking(e.target.value)}
                    value={negativeMarking}
                  >
                    <Radio value="yes">Yes</Radio>
                    <Radio value="no">No</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="Total Marks">
                  <Input readOnly value={calculateTotalMarks(marksPerQuestion, totalQuestions)} />
                </Form.Item>
              </Col>
            </Row>
            {negativeMarking === 'yes' && (
              <Form.Item label="Marks for Wrong Answer">
                <InputNumber
                  min={0}
                  onChange={(value) => setMarksForCorrectOption(value)}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
          </>
        )
      )}

<div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '2rem' }}>
      <h3>Specifications</h3>
      <h2>Response Selection</h2>
      <div>
        <label style={{ marginRight: '10px' }}>
          <input
            type="radio"
            value="ABC"
            checked={responseOption === 'ABC'}
            onChange={handleResponseOptionChange}
          />
          ABCD
        </label>
        <label>
          <input
            type="radio"
            value="123"
            checked={responseOption === '123'}
            onChange={handleResponseOptionChange}
          />
          1234
        </label>
      </div>

      <h2>Range</h2>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label htmlFor="numBlocks" style={{ marginRight: '10px' }}>
          Number of Blocks:
        </label>
        <select
          id="numBlocks"
          value={numBlocks}
          
          onChange={handleNumBlocksChange}
          style={{ marginRight: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
        >
          {[...Array(15)].map((_, index) => (
            <option key={index} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex' }}>
          {Array.from({ length: numBlocks }, (_, index) => (
            <div
              key={index}
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: '#ccc',
                marginRight: '10px',
                marginBottom: '10px',
                border: '1px solid #000',
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
      <div className="mt-3 text-center">
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
};

export default Segmentation;
