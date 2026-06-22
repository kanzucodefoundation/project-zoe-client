// import {useState} from 'react';
// import {Box, Toolbar} from '@mui/material';
// import {Sidebar} from './Sidebar';
// import {Header} from './Header';
// import * as React from "react";

// interface LayoutProps {
//     children: React.ReactNode;
//     title?: string;
// }

// const Layout = ({children, title}: LayoutProps) => {
//     const [mobileOpen, setMobileOpen] = useState(false);

//     const handleDrawerToggle = () => {
//         setMobileOpen(!mobileOpen);
//     };

//     return (
//         <Box sx={{
//             display: 'flex',
//             width: '100%',
//             height: '100%',
//             overflowX: 'hidden',
//             maxWidth: '100vw',
//         }}>
//             <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle}/>
//             <Box sx={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 width: '100%',
//                 height: '100%',
//                 overflowX: 'hidden',
//                 maxWidth: '100%',
//                 minWidth: 0, // Important: allows flex items to shrink below content size
//             }}>
//                 <Header title={title} onDrawerToggle={handleDrawerToggle}/>
//                 <Box
//                     component="main"
//                     sx={{
//                         flexGrow: 1,
//                         p: 3,
//                         minHeight: '100vh',
//                         position: 'relative',
//                         overflowX: 'hidden',
//                         maxWidth: '100%',
//                         minWidth: 0, // Important: allows flex items to shrink below content size
//                     }}
//                 >
//                     <Toolbar/>
//                     {children}
//                 </Box>
//             </Box>
//         </Box>
//     );
// };

// export default Layout;
