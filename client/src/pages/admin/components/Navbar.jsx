import { useDispatch, useSelector } from "react-redux";
import {
  openPages,
  setScreenSize,
  showSidebarOrNot,
  toggleSidebar,
} from "../../../redux/adminSlices/adminDashboardSlice/DashboardSlice";
import { AiOutlineMenu } from "react-icons/ai";
import { BsChatLeft } from "react-icons/bs";
import { RiNotification3Line } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { Chat, Notification, UserProfile } from ".";
import profiile from "../../../Assets/profile dummy image.png";
import { useEffect } from "react";
import PropTypes from "prop-types";

const Navbar = () => {
  const dispatch = useDispatch();
  const { chat, notification, userProfile, screenSize } = useSelector(
    (state) => state.adminDashboardSlice
  );
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const handleResize = () => dispatch(setScreenSize(window.innerWidth));
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  useEffect(() => {
    if (screenSize <= 900) {
      dispatch(showSidebarOrNot(false));
    } else {
      dispatch(showSidebarOrNot(true));
    }
  }, [screenSize, dispatch]);

  // Handle keyboard events for profile button
  const handleProfileKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dispatch(openPages("userProfile"));
    }
  };

  const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
    <TooltipComponent content={title} position={"BottomCenter"}>
      <button
        type="button"
        onClick={customFunc}
        style={{ color }}
        className="relative text-xl p-3 hover:bg-gray-100 rounded-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={title}
      >
        {dotColor && (
          <span
            style={{ backgroundColor: dotColor }}
            className="absolute inline-flex rounded-full right-[8px] top-2 h-2 w-2"
            aria-hidden="true"
          />
        )}
        {icon}
      </button>
    </TooltipComponent>
  );

  NavButton.propTypes = {
    title: PropTypes.string.isRequired,
    customFunc: PropTypes.func.isRequired,
    icon: PropTypes.node,
    color: PropTypes.string,
    dotColor: PropTypes.string,
  };

  return (
    <div className="flex justify-between p-2 md:mx-6 relative">
      <div>
        <NavButton
          title="Menú"
          customFunc={() => dispatch(toggleSidebar())}
          color={"blue"}
          icon={<AiOutlineMenu />}
        />
      </div>
      
      <div className="flex justify-between">
        <NavButton
          title="Chat"
          customFunc={() => dispatch(openPages("chat"))}
          color={"blue"}
          dotColor={"cyan"}
          icon={<BsChatLeft />}
        />
        
        <NavButton
          title="Notificación"
          customFunc={() => dispatch(openPages("notification"))}
          color={"blue"}
          dotColor={"gold"}
          icon={<RiNotification3Line />}
        />
        
        <TooltipComponent content="perfil" position="BottomCenter">
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            onClick={() => dispatch(openPages("userProfile"))}
            onKeyDown={handleProfileKeyDown}
            aria-label={`Perfil de usuario: ${currentUser?.username || "Usuario"}`}
          >
            <img 
              src={profiile} 
              alt={`Foto de perfil de ${currentUser?.username || "Usuario"}`}
              className="w-4 h-4 rounded-full"
            />
            <p>
              <span className="text-[12px] text-gray-400">Hola,</span>{" "}
              <span className="text-gray-400 font-semi-bold text-[12px]">
                {currentUser?.username || "Usuario"}
              </span>
            </p>
            <MdKeyboardArrowDown aria-hidden="true" />
          </button>
        </TooltipComponent>
        
        {/* Dropdown components with proper positioning */}
        {chat && (
          <div className="absolute top-full right-0 mt-2 z-50">
            <Chat />
          </div>
        )}
        
        {notification && (
          <div className="absolute top-full right-0 mt-2 z-50">
            <Notification />
          </div>
        )}
        
        {userProfile && (
          <div className="absolute top-full right-0 mt-2 z-50">
            <UserProfile />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;