import { motion } from 'framer-motion';
import { fadeUp } from '../../utils/motion.js';

const StatCard = ({ label, value, helper }) => (
  <motion.article className="stat-card" variants={fadeUp}>
    <p>{label}</p>
    <h3>{value}</h3>
    {helper ? <span>{helper}</span> : null}
  </motion.article>
);

export default StatCard;
