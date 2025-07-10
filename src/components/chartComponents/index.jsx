import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faRotateLeft, faCircleInfo, faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useChart } from '../../context/chartContext';


export const ChartTitle = ({ children }) => {
  // Displays the title of the chart using the children prop
  // Uses the useChart hook to access the chart object
  const { chart } = useChart();

  useEffect(() => {
    if (!chart || !children) return;

    chart.config.options.plugins.title.text = children;
    chart.config.options.plugins.title.display = true;
    chart.update();

  }, [chart, children]);

  return null;
};


export const ChartInstruction = () => {
  // Displays instruction for interacting with the chart when the info icon is hovered
    const [showInstructions, setShowInstructions] = useState(false);
    return (
      <div id="chart-instructions-container">
          <FontAwesomeIcon icon={faCircleInfo} onMouseEnter={() => setShowInstructions(true)} onMouseLeave={() => setShowInstructions(false)} />
          {showInstructions && (
            <div id="chart-instructions">
              <p>1. Click and drag, scroll or pinch on the chart to zoom in.</p>
              <p>2. Hover over data points when zoomed in to see the values.</p>
              <p>3. Click on the rectangle boxes on the side to toggle chart.</p>
            </div>
          )}
        </div>
    );
  };
  

export const ZoomResetTool = () => {
  // Resets the zoom level of the chart when the reset zoom icon is clicked
  // Uses the useChart hook to access the chart object
  const { chart } = useChart();

  const handleResetZoom = () => {
    if (!chart) return;
    chart.resetZoom();
  };

  return (
    <FontAwesomeIcon
      id="zoom-reset-button"
      icon={faRotateLeft}
      title="Reset Zoom"
      onClick={handleResetZoom}
    />
  );
};


export const CloseButton = ({ handleClose }) => (
  // Closes the chart when the close icon is clicked
  // Receives the handleClose function as a prop
  <FontAwesomeIcon
    id="chart-close-button"
    icon={faXmark}
    title="Close"
    onClick={handleClose}
  />
);


export const DataAccessTool = ({ dataAccessLink }) => {
  // Displays a link to the data access page when the data access link is provided

  useEffect(() => {
    if (!dataAccessLink) return;
  }, [dataAccessLink]);

  return (
    <a id="data-access-link" href={dataAccessLink} target="_blank" rel="noreferrer">
      <FontAwesomeIcon icon={faExternalLink} />
    </a>
  );
};
  

export const ChartTools = ({ children }) => {
  // Displays the chart tools
  return (
    <div className="chart-tools-container">
      {children}
    </div>
  );
};

  
export const ChartToolsLeft = ({ children }) => {
  // Left align chart tools
  return (
    <div id="chart-tools-left">
      <div id="chart-controls">
        {children}
      </div>
    </div>
  );
};
  

export const ChartToolsRight = ({ children }) => {
  // Right align chart tools
  return (
    <div id="chart-tools-right">
      <div id="chart-controls">
        {children}
      </div>
    </div>
  );
};
