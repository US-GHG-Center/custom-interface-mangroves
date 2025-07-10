import { styled as styledmui } from '@mui/material/styles';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import { VisualizationItemCard } from '../card';
import { useEffect, useState, useRef } from 'react';

import './index.css';

const drawerWidth = '30rem';
const Main = styledmui('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -drawerWidth,
  /**
   * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
   * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
   * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
   * proper interaction with the underlying content.
   */
  position: 'relative',
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
      },
    },
  ],
}));

const DrawerHeader = styledmui('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

const HorizontalLayout = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 5px;
  margin-bottom: 5px;
`;

/**
 * PersistentDrawerRight
 *
 * A right-side drawer that displays selected plume visualization items as cards.
 * Highlights the hovered item and auto-scrolls to bring it into view.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the drawer is open.
 * @param {Function} props.setOpen - Setter function to control drawer visibility.
 * @param {Array} props.selectedVizItems - Array of plume items currently in the viewport.
 * @param {string} props.hoveredVizLayerId - ID of the plume currently hovered on the map.
 * @param {string} props.collectionId - ID of the STAC collection
 * @param {Function} props.onSelectVizLayer - Called when a card is clicked.
 * @param {Function} props.onHoverOnVizLayer - Called on hover enter/leave.
 *
 * @returns {JSX.Element}
 */
export function PersistentDrawerRight({
  open,
  setOpen,
  selectedVizItems,
  hoveredVizLayerId,
  collectionId,
  onSelectVizLayer,
  onHoverOnVizLayer,
}) {
  const [numberOfVizItems, setNumberOfVizItems] = useState(0);
  const highlightedCardRef = useRef(null);

  const handleDrawerClose = () => {
    setOpen(false);
  };
  // console.log({ hoveredVizLayerId });
  useEffect(() => {
    if (!selectedVizItems.length) {
      setNumberOfVizItems(0);
      return;
    }
    const numberOfVizItems = selectedVizItems.length;
    setNumberOfVizItems(numberOfVizItems);
  }, [selectedVizItems]);

  useEffect(() => {
    if (hoveredVizLayerId && highlightedCardRef.current) {
      highlightedCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [hoveredVizLayerId]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Main open={open}>
        <DrawerHeader />
      </Main>
      <Drawer
        sx={{
          width: drawerWidth,
          marginRight: '5px',
          marginTop: '5px',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            marginRight: '5px',
            marginTop: '5px',
            height: 'calc(100vh - var(--colorbar-height) - 3.5%)', //colobar is up 3% from bottom
            borderRadius: '3px',
          },
        }}
        variant='persistent'
        anchor='right'
        open={open}
      >
        <DrawerHeader className='drawer-head'>
          <HorizontalLayout>
            <Typography
              variant='h6'
              component='div'
              fontWeight='bold'
              className='drawer-head-content'
            >
              Plume Complexes
            </Typography>
            <Typography
              variant='subtitle1'
              component='div'
              className='drawer-head-content'
            >
              {numberOfVizItems + ' Plumes'}
            </Typography>
          </HorizontalLayout>
        </DrawerHeader>
        {selectedVizItems?.length ? (
          selectedVizItems?.map((selectedVizItem) => (
            <VisualizationItemCard
              key={selectedVizItem?.id}
              ref={
                selectedVizItem?.id === hoveredVizLayerId
                  ? highlightedCardRef
                  : null
              }
              vizItem={selectedVizItem}
              collectionId={collectionId}
              onSelectVizLayer={onSelectVizLayer}
              hoveredVizItemId={hoveredVizLayerId}
              onHoverOnVizLayer={onHoverOnVizLayer}
            />
          ))
        ) : (
          <></>
        )}
      </Drawer>
    </Box>
  );
}
