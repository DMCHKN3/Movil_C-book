import analytics from '@react-native-firebase/analytics';

export const trackScreen = async (name) => {
  try {
    await analytics().logScreenView({ screen_name: name, screen_class: name });
  } catch (e) {
    console.error('Analytics screen error:', e);
  }
};

export const trackEvent = async (name, params = {}) => {
  try {
    await analytics().logEvent(name, params);
  } catch (e) {
    console.error('Analytics event error:', e);
  }
};

export const setUserId = async (id) => {
  try {
    await analytics().setUserId(String(id));
  } catch (e) {
    console.error('Analytics setUserId error:', e);
  }
};

export const setUserProps = async (props) => {
  try {
    await analytics().setUserProperties(props);
  } catch (e) {
    console.error('Analytics setUserProps error:', e);
  }
};
