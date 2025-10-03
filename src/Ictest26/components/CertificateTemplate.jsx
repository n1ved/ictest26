import React from 'react';
// Import certificate template images
import participantTemplate from '../../assets/certificates/PARTICIPANT.png';
import authorTemplate from '../../assets/certificates/AUTHOR.png'; 
import reviewerTemplate from '../../assets/certificates/REVIEWER.png';
import sessionChairTemplate from '../../assets/certificates/SESSION_CHAIR.png';

const CertificateTemplate = ({ 
  type = 'participation', 
  recipientName = '', 
  paperTitle = '',
  isPreview = false,
  namePosition = null,
  paperTitlePosition = null
}) => {
  // Certificate template configurations
  const certificateConfig = {
    participation: {
      templateImage: participantTemplate,
      namePosition: { top: '55%', left: '50%' }, // Adjust based on your template
      paperTitlePosition: null // No paper title for participation
    },
    author: {
      templateImage: authorTemplate,
      namePosition: { top: '47%', left: '50%' }, // Adjusted to center between lines
      paperTitlePosition: { top: '59%', left: '50%' } // Moved lower to the "for presenting a paper titled" section
    },
    reviewer: {
      templateImage: reviewerTemplate,
      namePosition: { top: '42%', left: '50%' },
      paperTitlePosition: null
    },
    session_chair: {
      templateImage: sessionChairTemplate,
      namePosition: { top: '42%', left: '50%' },
      paperTitlePosition: null
    }
  };

  const config = certificateConfig[type];
  
  // Use custom positions if provided, otherwise use default
  const finalNamePosition = namePosition || config.namePosition;
  const finalPaperTitlePosition = paperTitlePosition || config.paperTitlePosition;

  const certificateStyle = {
    width: isPreview ? '600px' : '2000px', // Match template width exactly when not preview
    height: isPreview ? '424px' : '1414px', // Match template height exactly when not preview
    position: 'relative',
    margin: '0 auto',
    boxShadow: isPreview ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
    transform: isPreview ? 'scale(1)' : 'scale(1)', // No scaling needed
    transformOrigin: 'top center',
    overflow: 'hidden'
  };

  const backgroundImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1
  };

  const overlayContainerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 2,
    pointerEvents: 'none'
  };

  const nameOverlayStyle = {
    position: 'absolute',
    top: finalNamePosition.top,
    left: finalNamePosition.left,
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    fontFamily: '"Times New Roman", serif',
    fontSize: isPreview ? '20px' : '66px', // Slightly larger and more prominent
    fontWeight: '700', // Bolder font weight
    color: '#2c2c2c', // Slightly darker for better contrast
    textShadow: isPreview ? '1px 1px 3px rgba(255,255,255,0.9)' : '2px 2px 5px rgba(255,255,255,0.9)',
    maxWidth: isPreview ? '350px' : '1200px',
    wordWrap: 'break-word',
    lineHeight: '1.1',
    letterSpacing: isPreview ? '0.5px' : '1.5px' // Better letter spacing
  };

  const paperTitleOverlayStyle = finalPaperTitlePosition ? {
    position: 'absolute',
    top: finalPaperTitlePosition.top,
    left: finalPaperTitlePosition.left,
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    fontFamily: '"Times New Roman", serif',
    fontSize: isPreview ? '13px' : '38px', // Larger and more readable
    fontWeight: '600', // Slightly lighter than name but still prominent
    color: '#1a1a1a', // Darker for better readability
    fontStyle: 'italic',
    textShadow: isPreview ? '1px 1px 3px rgba(255,255,255,0.9)' : '2px 2px 5px rgba(255,255,255,0.9)',
    maxWidth: isPreview ? '400px' : '1400px', // Wider to accommodate longer titles
    wordWrap: 'break-word',
    lineHeight: '1.1', // Tighter line spacing for multi-line titles
    letterSpacing: isPreview ? '0.3px' : '1px' // Improved letter spacing
  } : null;

  return (
    <div style={certificateStyle}>
      {/* Background Certificate Template */}
      <img 
        src={config.templateImage} 
        alt={`${type} certificate template`}
        style={backgroundImageStyle}
        draggable={false}
      />
      
      {/* Text Overlays */}
      <div style={overlayContainerStyle}>
        {/* Recipient Name Overlay */}
        <div style={nameOverlayStyle}>
          {recipientName || (isPreview ? 'Recipient Name' : '')}
        </div>
        
        {/* Paper Title Overlay (only for author certificates) */}
        {type === 'author' && paperTitle && paperTitleOverlayStyle && (
          <div style={paperTitleOverlayStyle}>
            "{paperTitle}"
          </div>
        )}
        
        {/* Placeholder for paper title in preview mode */}
        {type === 'author' && isPreview && !paperTitle && paperTitleOverlayStyle && (
          <div style={paperTitleOverlayStyle}>
            "Paper Title Here"
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateTemplate;