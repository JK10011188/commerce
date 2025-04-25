import React, { useRef, useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CImage
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilPlus } from '@coreui/icons'
import useCoupangStore from '../../../../stores/useCoupangStore'

const DetailImageUploader = () => {
  const fileInputRef = useRef(null);
  const sampleFileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSampleImage, setSelectedSampleImage] = useState(null);
  const { detailImages, setDetailImages, setDetailImageDragActive, sampleImages, setSampleImages, setSampleImageDragActive } = useCoupangStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete') {
        if (selectedImage) {
          handleDetailImageRemove(selectedImage);
        }
        if (selectedSampleImage) {
          handleSampleImageRemove(selectedSampleImage);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedSampleImage]);

  const handleDetailImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    const filesToProcess = Array.from(files).slice(0, 10 - detailImages.length);
    if (filesToProcess.length === 0) {
      alert('상세 이미지는 최대 10개까지 업로드할 수 있습니다.');
      return;
    }

    const newImages = [];
    
    for (const [idx, file] of filesToProcess.entries()) {
      if (!file.type.match('image.*')) {
        alert('이미지 파일만 업로드 가능합니다.');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB를 초과할 수 없습니다.');
        continue;
      }

      try {
        const imageId = Date.now() + idx;
        const preview = URL.createObjectURL(file);
        
        // 파일 객체 자체를 저장 (Base64 변환 없이)
        newImages.push({
          id: imageId,
          file: file, // 원본 파일 객체 저장
          preview: preview,
          name: file.name,
          order: detailImages.length + newImages.length + 1
        });
      } catch (error) {
        console.error('이미지 처리 중 오류 발생:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    }

    if (newImages.length > 0) {
      setDetailImages([...detailImages, ...newImages]);
      setDetailImageDragActive(false);
    }
  };

  const handleSampleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    const filesToProcess = Array.from(files).slice(0, 10 - sampleImages.length);
    if (filesToProcess.length === 0) {
      alert('샘플 증여 상품 이미지는 최대 10개까지 업로드할 수 있습니다.');
      return;
    }

    const newImages = [];
    
    for (const [idx, file] of filesToProcess.entries()) {
      if (!file.type.match('image.*')) {
        alert('이미지 파일만 업로드 가능합니다.');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB를 초과할 수 없습니다.');
        continue;
      }

      try {
        const imageId = Date.now() + idx;
        const preview = URL.createObjectURL(file);
        
        newImages.push({
          id: imageId,
          file: file,
          preview: preview,
          name: file.name,
          order: sampleImages.length + newImages.length + 1
        });
      } catch (error) {
        console.error('이미지 처리 중 오류 발생:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    }

    if (newImages.length > 0) {
      setSampleImages([...sampleImages, ...newImages]);
      setSampleImageDragActive(false);
    }
  };

  const handleDetailImageRemove = (imageId) => {
    const imageToRemove = detailImages.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    const updatedImages = detailImages.filter(img => img.id !== imageId)
      .map((img, index) => ({ ...img, order: index + 1 }));
    setDetailImages(updatedImages);
    if (selectedImage === imageId) {
      setSelectedImage(null);
    }
  };

  const handleSampleImageRemove = (imageId) => {
    const imageToRemove = sampleImages.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    const updatedImages = sampleImages.filter(img => img.id !== imageId)
      .map((img, index) => ({ ...img, order: index + 1 }));
    setSampleImages(updatedImages);
    if (selectedSampleImage === imageId) {
      setSelectedSampleImage(null);
    }
  };

  const handleDetailImageSelect = (imageId) => {
    if (selectedImage && selectedImage !== imageId) {
      const sourceImage = detailImages.find(img => img.id === selectedImage);
      const targetImage = detailImages.find(img => img.id === imageId);
      if (sourceImage && targetImage) {
        const sourceOrder = sourceImage.order;
        const targetOrder = targetImage.order;
        const updatedImages = detailImages.map(img => {
          if (img.id === selectedImage) return { ...img, order: targetOrder };
          if (img.id === imageId) return { ...img, order: sourceOrder };
          return img;
        }).sort((a, b) => a.order - b.order);
        setDetailImages(updatedImages);
      }
      setSelectedImage(null);
    } else if (selectedImage === imageId) {
      setSelectedImage(null);
    } else {
      setSelectedImage(imageId);
    }
  };

  const handleSampleImageSelect = (imageId) => {
    if (selectedSampleImage && selectedSampleImage !== imageId) {
      const sourceImage = sampleImages.find(img => img.id === selectedSampleImage);
      const targetImage = sampleImages.find(img => img.id === imageId);
      if (sourceImage && targetImage) {
        const sourceOrder = sourceImage.order;
        const targetOrder = targetImage.order;
        const updatedImages = sampleImages.map(img => {
          if (img.id === selectedSampleImage) return { ...img, order: targetOrder };
          if (img.id === imageId) return { ...img, order: sourceOrder };
          return img;
        }).sort((a, b) => a.order - b.order);
        setSampleImages(updatedImages);
      }
      setSelectedSampleImage(null);
    } else if (selectedSampleImage === imageId) {
      setSelectedSampleImage(null);
    } else {
      setSelectedSampleImage(imageId);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleDetailImageUpload(e.target.files);
      e.target.value = '';
    }
  };

  const handleSampleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSampleImageUpload(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>상세 설명 이미지</strong>
        </CCardHeader>
        <CCardBody>
          {detailImages.length === 0 ? (
            <div 
              className="detail-image-upload-area"
              onClick={() => fileInputRef.current.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDetailImageDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDetailImageDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDetailImageDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleDetailImageUpload(e.dataTransfer.files);
                }
              }}
            >
              <div className="upload-icon">
                <CIcon icon={cilCloudUpload} size="3xl" />
              </div>
              <div className="upload-text">
                <p>여기에 이미지를 드래그하거나 클릭하여 업로드</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                />
                <p className="mt-2 text-muted">지원 형식: JPG, PNG, GIF (최대 10MB)</p>
              </div>
            </div>
          ) : (
            <div 
              className="detail-images-container"
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDetailImageDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDetailImageDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDetailImageDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleDetailImageUpload(e.dataTransfer.files);
                }
              }}
            >
              {detailImages.map(image => (
                <div key={image.id} 
                  className={`detail-image-item ${selectedImage === image.id ? 'selected' : ''}`}
                  onClick={() => handleDetailImageSelect(image.id)}
                  onDoubleClick={() => handleDetailImageRemove(image.id)}
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                >
                  <div className="image-order">{image.order}</div>
                  <CImage rounded thumbnail src={image.preview} width={130} height={130} alt={image.name} draggable="false" />
                </div>
              ))}
              {detailImages.length < 10 && (
                <div className="add-detail-image-btn" onClick={() => fileInputRef.current.click()}>
                  <CIcon icon={cilPlus} size="xl" />
                  <div>이미지 추가</div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                  />
                </div>
              )}
            </div>
          )}
        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader>
          <strong>샘플 증여 상품 이미지</strong>
        </CCardHeader>
        <CCardBody>
          {sampleImages.length === 0 ? (
            <div 
              className="detail-image-upload-area"
              onClick={() => sampleFileInputRef.current.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSampleImageDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSampleImageDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSampleImageDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleSampleImageUpload(e.dataTransfer.files);
                }
              }}
            >
              <div className="upload-icon">
                <CIcon icon={cilCloudUpload} size="3xl" />
              </div>
              <div className="upload-text">
                <p>여기에 샘플 증여 상품 이미지를 드래그하거나 클릭하여 업로드</p>
                <input
                  type="file"
                  ref={sampleFileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*"
                  onChange={handleSampleFileInput}
                />
                <p className="mt-2 text-muted">지원 형식: JPG, PNG, GIF (최대 10MB, 최대 10개)</p>
              </div>
            </div>
          ) : (
            <div 
              className="detail-images-container"
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSampleImageDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSampleImageDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSampleImageDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleSampleImageUpload(e.dataTransfer.files);
                }
              }}
            >
              {sampleImages.map(image => (
                <div key={image.id} 
                  className={`detail-image-item ${selectedSampleImage === image.id ? 'selected' : ''}`}
                  onClick={() => handleSampleImageSelect(image.id)}
                  onDoubleClick={() => handleSampleImageRemove(image.id)}
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                >
                  <div className="image-order">{image.order}</div>
                  <CImage rounded thumbnail src={image.preview} width={130} height={130} alt={image.name} draggable="false" />
                </div>
              ))}
              {sampleImages.length < 10 && (
                <div className="add-detail-image-btn" onClick={() => sampleFileInputRef.current.click()}>
                  <CIcon icon={cilPlus} size="xl" />
                  <div>이미지 추가</div>
                  <input
                    type="file"
                    ref={sampleFileInputRef}
                    style={{ display: 'none' }}
                    multiple
                    accept="image/*"
                    onChange={handleSampleFileInput}
                  />
                </div>
              )}
            </div>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default DetailImageUploader;
