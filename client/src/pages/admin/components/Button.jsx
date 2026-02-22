import PropTypes from 'prop-types';

function Button({ bgColor, color, size, text, borderRadius }) {
  return (
    <button 
      type="button" 
      style={{ backgroundColor: bgColor, color, borderRadius }} 
      className={`text-${size} p-3 hover:drop-shadow-xl`}
    >
      {text}
    </button>
  );
}

Button.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
  text: PropTypes.string.isRequired,
  borderRadius: PropTypes.string,
};

Button.defaultProps = {
  bgColor: '#3b82f6',
  color: '#ffffff',
  size: 'base',
  borderRadius: '0.5rem',
};

export default Button;