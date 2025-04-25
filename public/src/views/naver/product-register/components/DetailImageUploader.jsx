import React, { useRef, useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CImage
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilPlus } from '@coreui/icons'
import { useProductStore } from '../../../../stores/useNaverStore'

const DetailImageUploader = () => {
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { detailImages, setDetailImages, setDetailImageDragActive } = useProductStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedImage) {
        handleDetailImageRemove(selectedImage);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

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

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleDetailImageUpload(e.target.files);
      e.target.value = '';
    }
  };

  return (
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
  );
};

export default DetailImageUploader;
