import React, { useEffect, useState } from 'react';
import { Button, Drawer, Modal, Select, Space, notification } from 'antd';
import ImageUploader from './ImageUploader';
import AnnotationCanvas from './AnnotationCanvas';
import Toolkit from './Toolkit';
import { CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useProjectId } from '@/store/ProjectState';
import { handleEncrypt, handleDecrypt } from '@/Security/Security';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';

//const apiurl = import.meta.env.VITE_API_URL_PROD;
const apiurl = import.meta.env.VITE_API_URL;

const { Option } = Select;

const AnnotationPage = () => {
  const projectId = useProjectId();
  const [imageUrl, setImageUrl] = useState(null);
  const [annotations, setAnnotations] = useState(() => {
    const savedAnnotations = localStorage.getItem('annotations');
    return savedAnnotations ? JSON.parse(savedAnnotations) : [];
  });
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [isAdjustingSize, setIsAdjustingSize] = useState(false);
  const [selectedInputField, setSelectedInputField] = useState(null);
  const [mappedFields, setMappedFields] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [inputFields, setInputFields] = useState([]);
  const [open, setOpen] = useState(false);
  const [annotationId, setAnnotationId] = useState(0);
  const database = useDatabase();
  const token = useUserToken();

  useEffect(() => {
    // Fetch input fields from API
    axios
      .get(`${apiurl}/Fields?WhichDatabase=${database}`,{
        headers:{
        Authorization : `Bearer ${token}`
      }})
      .then((response) => {
        const fieldNames = response.data.map((field) => field.fieldName); // Extract field names
        setInputFields(fieldNames);
      })
      .catch((error) => {
        console.error('Error fetching input fields:', error);
      });
  }, []);

  // get image config by perojecvt id
  useEffect(() => {
    // Fetch annotations by project ID
    axios
      .get(`${apiurl}/ImageConfigs/ByProjectId/${projectId}?WhichDatabase=${database}`,{
        headers:{
        Authorization : `Bearer ${token}`
      }})
      .then((response) => {
        let decryptresponse = handleDecrypt(response.data);
        let destrigifieddata = JSON.parse(decryptresponse)
        const resdata = destrigifieddata[0].Annotations;
        if (resdata.length<=0) {
          localStorage.removeItem('annotations')
        }
        const fetchedAnnotations = resdata.map((annotation) => {
          // Fixing the coordinates format to be valid JSON
          const fixedCoordinates = annotation.Coordinates
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/(\w+):/g, '"$1":'); // Wrap property names with double quotes

          return {
            FieldName: annotation.FieldName,
            FieldValue: '', // Assuming you want an empty string for FieldValue
            coordinates: JSON.parse(fixedCoordinates), // Parse fixed coordinates JSON
          };
        });
        setAnnotationId(destrigifieddata[0].Id);
        setImageUrl(destrigifieddata[0].ImageUrl);
        setAnnotations(fetchedAnnotations);
        localStorage.setItem('annotations', JSON.stringify(fetchedAnnotations));
      })
      .catch((error) => {
        console.error('Error fetching annotations:', error);
      });
  }, [projectId]);

  useEffect(() => {
    const mappedFieldsObj = {};
    annotations.forEach((annotation) => {
      mappedFieldsObj[annotation.FieldName] = true;
    });
    setMappedFields(mappedFieldsObj);
  }, [annotations]);

  const handleAddAnnotation = (coordinates) => {
    if (coordinates.width <= 0 || coordinates.height <= 0) {
      return;
    }

    const unmappedInputFields = inputFields.filter(
      (field) => !annotations.some((annotation) => annotation.FieldName === field),
    );

    if (unmappedInputFields.length === 0) {
      alert('All input fields are already mapped.');
      return;
    }

    setModalFields(unmappedInputFields);
    setOpenModal(true);
    setCoordinates(coordinates);
  };

  useEffect(() => {
    const unmappedInputFields = inputFields.filter(
      (field) => !annotations.some((annotation) => annotation.FieldName === field),
    );
    setModalFields(unmappedInputFields);
  }, [annotations]);

  const handleFieldSelect = (selectedField) => {
    const newAnnotation = {
      coordinates,
      FieldName: selectedField,
      FieldValue: '',
    };
    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    setSelectedInputField('');
    localStorage.setItem('annotations', JSON.stringify(updatedAnnotations));

    setOpenModal(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedInputField(null);
  };

  const handleImageSelect = (url, width, height) => {
    setImageUrl(url);
  };

  useEffect(() => {
    if (selectedAnnotation !== null) {
      setSelectedInputField(annotations[selectedAnnotation].FieldName);
    }
  }, [selectedAnnotation, annotations]);

  useEffect(() => {
    if (selectedAnnotation !== null) {
      const updatedAnnotations = [...annotations];
      updatedAnnotations[selectedAnnotation].FieldName = selectedInputField;
      localStorage.setItem('annotations', JSON.stringify(updatedAnnotations));
    }
  }, [selectedAnnotation, selectedInputField, annotations]);

  const handleDeleteAnnotation = () => {
    const updatedAnnotations = annotations.filter((_, i) => i !== selectedAnnotation);
    setAnnotations(updatedAnnotations);
    setSelectedAnnotation(null);
    setOpen(false);
    setIsAdjustingSize(false);
    localStorage.setItem('annotations', JSON.stringify(updatedAnnotations));
  };

  const handleAdjustSize = () => {
    setIsAdjustingSize(!isAdjustingSize);
  };

  const handleResize = (index, deltaX, deltaY, corner) => {
    const updatedAnnotations = [...annotations];
    const annotation = updatedAnnotations[index];
    const { x, y, width, height } = annotation.coordinates;

    switch (corner) {
      case 'bottom-left':
        annotation.coordinates = {
          ...annotation.coordinates,
          x: x + deltaX,
          width: width - deltaX,
          height: height + deltaY,
        };
        break;
      case 'bottom-right':
        annotation.coordinates = {
          ...annotation.coordinates,
          width: width + deltaX,
          height: height + deltaY,
        };
        break;
      case 'top-left':
        annotation.coordinates = {
          ...annotation.coordinates,
          x: x + deltaX,
          y: y + deltaY,
          width: width - deltaX,
          height: height - deltaY,
        };
        break;
      case 'top-right':
        annotation.coordinates = {
          ...annotation.coordinates,
          y: y + deltaY,
          width: width + deltaX,
          height: height - deltaY,
        };
        break;
      default:
        break;
    }

    setAnnotations(updatedAnnotations);
    localStorage.setItem('annotations', JSON.stringify(updatedAnnotations));
  };

  const handleAdjustLeftSize = (deltaX) => {
    handleResize(selectedAnnotation, deltaX, 0, 'bottom-left');
  };

  const handleAdjustRightSize = (deltaX) => {
    handleResize(selectedAnnotation, deltaX, 0, 'bottom-right');
  };

  const handleAdjustTopSize = (deltaY) => {
    handleResize(selectedAnnotation, 0, deltaY, 'top-left');
  };

  const handleAdjustBottomSize = (deltaY) => {
    handleResize(selectedAnnotation, 0, deltaY, 'bottom-right');
  };

  const submitAnnotation = async () => {
    try {
      const postData = {
        id: annotationId,
        projectId,
        ImageUrl: imageUrl,
        annotations: annotations.map((annotation) => ({
          FieldName: annotation.FieldName,
          coordinates: JSON.stringify(annotation.coordinates).replace(/\"/g, "'"),
        })),
      };

      const putdatajson = JSON.stringify(postData)
          let encrypteddata = handleEncrypt(putdatajson)

          const encrypteddatatosend = {
            cyphertextt : encrypteddata
          }
      if (annotationId > 0) {
        // Annotations exist, use PUT to update
        const putResponse = await axios.put(
          `${apiurl}/ImageConfigs/${annotationId}?WhichDatabase=${database}`,
          encrypteddatatosend,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization : `Bearer ${token}`,
            },
          },
        );
        notification.success({
          message: 'Annotations updated successfully!',
          duration: 3,
        });
      } else {
        // No annotations exist, use POST to create new annotations
        const { id, ...postDataWithoutId } = postData; // Destructure to remove `id`

        const putdatajson = JSON.stringify(postDataWithoutId)
          let encrypteddata = handleEncrypt(putdatajson)

          const encrypteddatatosend = {
            cyphertextt : encrypteddata
          }

        const postResponse = await axios.post(
          `${apiurl}/ImageConfigs?WhichDatabase=${database}`,
          encrypteddatatosend,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization : `Bearer ${token}`,
            },
          },
        );
        setAnnotationId(postResponse.data.id);
        notification.success({
          message: 'Annotations submitted successfully!',
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Failed to add/update Annotations',
        description: error.message,
        duration: 3,
      });
    }
  };

  const handleCloseAnnotation = () => {
    setSelectedAnnotation(null);
    setOpen(false);
    setIsAdjustingSize(false);
  };

  return (
    <div>
      <Drawer
        extra={
          <Space>
            <Button danger onClick={handleCloseAnnotation}>
              Close
            </Button>
          </Space>
        }
        onClose={handleCloseAnnotation}
        open={open}
      >
        {selectedAnnotation !== null && (
          <div>
            <Toolkit
              annotations={annotations}
              onDelete={handleDeleteAnnotation}
              onAdjustSize={handleAdjustSize}
              isAdjustingSize={isAdjustingSize}
              onLeftAdjust={handleAdjustLeftSize}
              onRightAdjust={handleAdjustRightSize}
              onTopAdjust={handleAdjustTopSize}
              onBottomAdjust={handleAdjustBottomSize}
              inputFields={inputFields}
              selectedInputField={selectedInputField}
              setSelectedInputField={setSelectedInputField}
              mappedFields={mappedFields}
              selectedAnnotation={selectedAnnotation}
              setAnnotations={setAnnotations}
            />
          </div>
        )}
      </Drawer>

      <div className="d-flex align-items-center justify-content-around m-1">
        <ImageUploader onImageSelect={handleImageSelect} />
        {annotations.length > 0 && imageUrl && (
          <Button type="primary" onClick={submitAnnotation}>
            Submit Annotation
          </Button>
        )}
      </div>

      {imageUrl && (
        <div className="d-flex justify-content-center">
          <div style={{ position: 'relative' }}>
            <AnnotationCanvas imageUrl={imageUrl} onAddAnnotation={handleAddAnnotation} />
            {annotations.map((annotation, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: `${annotation.coordinates.x}px`,
                  top: `${annotation.coordinates.y}px`,
                  width: `${annotation.coordinates.width}px`,
                  height: `${annotation.coordinates.height}px`,
                  border: selectedAnnotation === index ? '3px solid red' : '3px solid blue',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSelectedAnnotation(index);
                  setOpen(true);
                }}
              >
                {selectedAnnotation !== index && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      width: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '12px',
                    }}
                  >
                    {annotation.FieldName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        title="Select Field"
        visible={openModal}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => handleFieldSelect(selectedInputField)}>
            Submit
          </Button>,
        ]}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select an input field"
          onChange={(value) => setSelectedInputField(value)}
          value={selectedInputField}
        >
          {modalFields.map((field, index) => (
            <Select.Option key={index} value={field}>
              {field}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default AnnotationPage;
