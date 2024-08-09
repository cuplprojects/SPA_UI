import React, { useEffect, useState } from 'react';
import {
  Select,
  Checkbox,
  Form,
  Button,
  Input,
  InputNumber,
  Radio,
  Divider,
  Modal,
  notification,
} from 'antd';
import { useProjectId } from '@/store/ProjectState';
import ResponseConfig from '../Response/ResponseConfig';
import { Col, Row } from 'react-bootstrap';
import { useDatabase } from '@/store/DatabaseStore';
import ViewSegmentation from './ViewSegmentation';
import { handleEncrypt } from '@/Security/Security';
import axios from 'axios';
import { useUserToken } from '@/store/UserDataStore';

const { Option } = Select;
const apiurl = import.meta.env.VITE_API_URL;

const Segmentation = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [hasSections, setHasSections] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState('');
  const [questionFrom, setQuestionFrom] = useState('');
  const [questionTo, setQuestionTo] = useState('');
  const [marksPerQuestion, setMarksPerQuestion] = useState('');
  const [sections, setSections] = useState([]);
  const [negativeMarking, setNegativeMarking] = useState('no');
  const [marksForWrongOption, setMarksForWrongOption] = useState('');
  const [courseOptions, setCourseOptions] = useState([]);
  const projectId = useProjectId();
  const [responseOption, setResponseOption] = useState('ABC');
  const [numBlocks, setNumBlocks] = useState(4); // State for selected response option
  const database = useDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingCourses, setExistingCourses] = useState([]);
  const [data, setData] = useState([]);
  const token = useUserToken();
  const [error, setError] = useState(null);

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

  const handleCoursesRetrieved = (courses) => {
    setExistingCourses(courses);
  };

  const filteredCourseOptions = courseOptions.filter((course) => !existingCourses.includes(course));

  const closeModal = () => {
    setModalVisible(false);
    // getdata();
  };

  const handleClick = (sectionName) => {
    setSelectedCourse(sectionName); // Set selected course for modal display
    setModalVisible(true); // Show the modal
  };

  const handleModalClose = () => {
    setModalVisible(false); // Close the modal
    setSelectedCourse(''); // Clear selected course
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

  useEffect(() => {
    fetchData();
  }, [projectId, database]);

  const handleNumberChange = (value) => {
    if (typeof value === 'number' && !isNaN(value)) {
      if (value > marksPerQuestion) {
        setError(`Value must be less than or equal to ${marksPerQuestion? marksPerQuestion: 'Marks Per Correct Question'}`);
      } else {
        setError(null);
      }
      setMarksForWrongOption(value);
    }
  };

  const handleKeyPress = (event) => {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `${apiurl}/Registration/GetUniqueValues?whichDatabase=${database}&key=Course%20Name&ProjectId=${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
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

  const applyExistingResponseToAllCourses = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch existing responses for the given project ID
      const response = await fetch(
        `${apiurl}/ResponseConfigs/byproject/${projectId}?WhichDatabase=${database}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch existing responses');
      }

      const existingResponses = await response.json();

      // Check if any existing response is available
      if (existingResponses.length === 0) {
        notification.warning({
          message: 'No existing responses found',
          description:
            'Please create a response for a course first before applying it to all courses.',
          duration: 5,
        });
        setLoading(false);
        return;
      }

      // Step 2: Allow the user to select an existing response from the available ones
      const selectedResponse = existingResponses.find((item) => item.courseName === selectedCourse);

      if (!selectedResponse) {
        notification.warning({
          message: 'No response found for the selected course',
          description: 'Please select a course with an existing response or create one first.',
          duration: 5,
        });
        setLoading(false);
        return;
      }

      // Step 3: Prepare and submit the data for all courses except the one from which the response was taken
      const submitForCourse = async (courseName) => {
        // Clone the selected response and modify as necessary
        const dataToSubmit = {
          ...selectedResponse,
          responseId: 0, // Set this to 0 or omit it if creating a new response
          courseName: courseName || '',
        };

        const encryptedDatatosubmit = {
          cyphertextt: handleEncrypt(JSON.stringify(dataToSubmit)),
        };

        await axios.post(
          `${apiurl}/ResponseConfigs?WhichDatabase=${database}`,
          encryptedDatatosubmit,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      };

      // Step 4: Loop through all courses, except the one from which the response was taken
      for (const course of filteredCourseOptions) {
        if (course !== selectedCourse) {
          await submitForCourse(course);
        }
      }

      notification.success({
        message: 'Existing response applied to all courses successfully',
        duration: 3,
      });

      // Reset form and loading state
      setSelectedCourse('');
      setHasSections(false);
      setTotalQuestions('');
      setQuestionFrom('');
      setQuestionTo('');
      setMarksPerQuestion('');
      setSections([]);
      setNegativeMarking('no');
      setMarksForWrongOption('');
      setResponseOption('ABC');
      setLoading(false);
      fetchData();
    } catch (error) {
      notification.error({
        message: 'Error applying existing response',
        description: error.message,
        duration: 3,
      });

      setLoading(false);
    }
  };

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
          marksForWrongAnswer: marksForWrongOption,
        },
      ]);
    }
  }, [
    totalQuestions,
    questionFrom,
    questionTo,
    marksPerQuestion,
    negativeMarking,
    marksForWrongOption,
  ]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${apiurl}/ResponseConfigs/byproject/${projectId}?WhichDatabase=${database}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      const transformedData = result.map((item) => ({
        key: item.responseId, // Use responseId as the unique key
        courseName: item.courseName || 'No Section Defined',
        sections: item.sections,
      }));

      setData(transformedData);
      setLoading(false);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch data!',
        duration: 3,
      });
      setLoading(false);
    }
  };

  // Function that needs to be async
  const submitData = async () => {

    if (!error) {
      setLoading(true);
      try {
        // Ensure numBlocks is defined or set a default value // Initialize this value as needed

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

        console.log('Data to submit:', JSON.stringify(dataToSubmit));
        // Log the data to ensure it's formatted correctly
        const encryptedDatatosubmit = {
          cyphertextt: handleEncrypt(JSON.stringify(dataToSubmit)),
        };

        // Perform the API request
        const response = await axios.post(
          `${apiurl}/ResponseConfigs?WhichDatabase=${database}`,
          encryptedDatatosubmit,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },

          },
        );

        notification.success({
          message: 'Response submitted successfully',
          duration: 3,
        });
        setSelectedCourse('');
        setHasSections(false);
        setTotalQuestions('');
        setQuestionFrom('');
        setQuestionTo('');
        setMarksPerQuestion('');
        setSections([]);
        setNegativeMarking('no');
        setMarksForWrongOption('');
        setResponseOption('ABC'); // Reset to default or initial value

        // Set loading to false
        setLoading(false);
        fetchData();
      } catch (error) {
        notification.error({
          message: 'Error submitting response',
          description: error.message,
          duration: 3,
        });

        // Ensure loading state is reset even if an error occurs
        setLoading(false);
      }
    }else{
      notification.error({
        message: error
      })
    }
  };

  return (
    <>
      <div className="text-end">
        <Form.Item>
          <Button type="primary" onClick={applyExistingResponseToAllCourses} disabled={loading}>
            {loading ? 'Applying...' : 'Apply Response to All Courses'}
          </Button>
        </Form.Item>
      </div>
      <Form layout="vertical" onFinish={submitData}>
        <div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3>Sections</h3>
            </div>

            <div>
              <Button
                type="primary"
                style={{ marginTop: 10 }}
                onClick={() => handleClick(sections.sectionName)}
              >
                View Sections
              </Button>
              {modalVisible && (
                <Modal
                  title="View Sections"
                  open={modalVisible}
                  onCancel={closeModal}
                  footer={null}
                  width={1000}
                  style={{ overflowX: 'scroll' }}
                >
                  {modalVisible && (
                    <ViewSegmentation
                      courseName={selectedCourse}
                      onCoursesRetrieved={handleCoursesRetrieved}
                      data={data}
                      fetchData={fetchData}
                    />
                  )}
                </Modal>
              )}
            </div>
          </div>

          <Row>
            {/* <Col>
            <Form.Item label="Select Course">
              <Select
                placeholder="Select a course"
                onChange={handleCourseChange}
                value={selectedCourse}
              >
                {filteredCourseOptions.map((course) => (
                  <Option key={course} value={course}>
                    {course}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}
            <Col>
              <Form.Item label="Select Course">
                {courseOptions && courseOptions.length > 0 ? (
                  <Select
                    placeholder="Select a course"
                    onChange={handleCourseChange}
                    value={selectedCourse}
                  >
                    {filteredCourseOptions.map((course, index) => (
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
                          onKeyPress={handleKeyPress}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <Form.Item label="Question From">
                        <Input
                          value={section.questionFrom}
                          onChange={(e) =>
                            handleSectionChange(index, 'questionFrom', e.target.value)
                          }
                          onKeyPress={handleKeyPress}
                        />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item label="Question To">
                        <Input
                          value={section.questionTo}
                          onChange={(e) => handleSectionChange(index, 'questionTo', e.target.value)}
                          onKeyPress={handleKeyPress}
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
                          onChange={(value) =>
                            handleSectionChange(index, 'marksPerQuestion', value)
                          }
                          style={{ width: '100%' }}
                          onKeyPress={handleKeyPress}
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
                          value={calculateTotalMarks(
                            section.marksPerQuestion,
                            section.totalQuestions,
                          )}
                          onKeyPress={handleKeyPress}
                        />
                      </Form.Item>
                    </Col>
                    <Col>
                      {section.negativeMarking === 'yes' && (
                        <Form.Item label="Marks Deduction  for Wrong Answer">
                          <InputNumber
                            min={0}
                            value={section.marksForWrongAnswer}
                            onChange={(value) =>
                              handleSectionChange(index, 'marksForWrongAnswer', value)
                            }
                            style={{ width: '100%' }}
                            onKeyPress={handleKeyPress}
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
                        onKeyPress={handleKeyPress}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item label="Question From">
                      <Input onChange={(e) => setQuestionFrom(e.target.value)}  onKeyPress={handleKeyPress} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Item label="Question To">
                      <Input onChange={(e) => setQuestionTo(e.target.value)} 
                      onKeyPress={handleKeyPress} />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item label="Marks Per Correct Question">
                      <InputNumber
                        min={0}
                        onChange={(value) => setMarksPerQuestion(value)}
                        style={{ width: '100%' }}
                        onKeyPress={handleKeyPress}
                      />
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
                      <Input
                        readOnly
                        value={calculateTotalMarks(marksPerQuestion, totalQuestions)}
                        onKeyPress={handleKeyPress}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {negativeMarking === 'yes' && (
                  <Form.Item
                    label="Marks Deduction for Wrong Answer"
                    status={error ? 'error' : ''}
                    help={error}
                  >
                    <InputNumber
                      prefix="-"
                      value={marksForWrongOption}
                      onChange={handleNumberChange}
                      onKeyPress={handleKeyPress}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                )}
              </>
            )
          )}
        </div>


        <div>
          <ResponseConfig numBlocks = {numBlocks} setNumBlocks = {setNumBlocks} responseOption = {responseOption} setResponseOption = {setResponseOption} />
        </div>
        <div className="mt-3 text-center">
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </>

  );
};

export default Segmentation;
