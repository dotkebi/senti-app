import React, { useMemo } from 'react';
import {
  View,
  Animated,
  StyleSheet,
} from 'react-native';
import { useAnimation } from 'react-native-animation-hooks';
import { palette } from 'constants/style';
import { SCREEN_WIDTH } from 'constants/config';

interface Props {
  audio: PlayableAudio;
  duration: number;
}

const StoryProgressBar: React.FunctionComponent<Props> = ({
  audio,
  duration,
}) => {
  const progressAnimation = useAnimation({
    type: 'timing',
    toValue: audio.isPlaying ? 1 : audio.elapsedTime / duration,
    initialValue: audio.elapsedTime / duration,
    duration: audio.isPlaying ? duration : 400,
    useNativeDriver: true,
  });

  const progressStyle = useMemo(() => ([styles.innerBar, {
    transform: [{
      translateX: progressAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-SCREEN_WIDTH + 4, 0],
        extrapolate: 'clamp',
      }),
    }],
  }]), [progressAnimation]);

  return (
    <View style={styles.outerBar}>
      <Animated.View style={progressStyle} />
    </View>
  );
};

const styles = StyleSheet.create({
  outerBar: {
    height: 2,
    backgroundColor: palette.transparent.black[60],
    overflow: 'hidden',
  },
  innerBar: {
    backgroundColor: palette.yellow.default,
    height: 2,
    borderRadius: 2,
  },
});

export default StoryProgressBar;
