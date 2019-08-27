import React, { useCallback, useMemo } from 'react';
import firebase from 'react-native-firebase';
import {
  withNavigation,
  NavigationInjectedProps,
} from 'react-navigation';
import {
  useQuery,
  useMutation,
} from '@apollo/react-hooks';
import { TagItem } from 'components';
import {
  FETCH_PROFILE,
  SUBSCRIBE_TAG,
  UNSUBSCRIBE_TAG,
} from 'graphqls';

interface Props extends NavigationInjectedProps {
  item: Tag;
}

const TagItemContainer: React.FunctionComponent<Props> = ({
  item,
  navigation,
}) => {
  const { data: profile } = useQuery<{ me: Profile }>(FETCH_PROFILE, {
    skip: !firebase.auth().currentUser,
    fetchPolicy: 'cache-only',
  });

  const [subscribeTag, { loading: subscribing }] = useMutation<Tag>(SUBSCRIBE_TAG, {
    variables: {
      id: item.id,
      name: item.name,
    },
    update: (cache, { data }) => {
      const savedProfile = cache.readQuery<{ me: Profile }>({ query: FETCH_PROFILE });

      if (!savedProfile) {
        return;
      }

      cache.writeQuery({
        query: FETCH_PROFILE,
        data: {
          ...savedProfile.me,
          tags: savedProfile.me.tags.concat(data.subscribeTag),
        },
      });
    },
  });

  const [unsubscribeTag, { loading: unsubscribing }] = useMutation<Tag>(UNSUBSCRIBE_TAG, {
    variables: {
      id: item.id,
    },
    update: (cache, { data }) => {
      const savedProfile = cache.readQuery<{ me: Profile }>({ query: FETCH_PROFILE });

      if (!savedProfile) {
        return;
      }

      cache.writeQuery({
        query: FETCH_PROFILE,
        data: {
          ...savedProfile.me,
          tags: savedProfile.me.tags.filter(t => t.id !== data.unsubscribeTag.id),
        },
      });
    },
  });

  const isSubscribed = useMemo(() => profile ? !!profile.me.tags.find(t => t.id === item.id) : false, [profile]);

  const toggle = useCallback(() => {
    isSubscribed ? unsubscribeTag() : subscribeTag();
  }, [isSubscribed]);

  const openTagStoryScreen = useCallback(() => {
    navigation.navigate('TagStory', { id: item.id });
  }, [item]);

  return (
    <TagItem
      item={item}
      isSubscribed={isSubscribed}
      isLoading={subscribing || unsubscribing}
      toggle={toggle}
      openTagStoryScreen={openTagStoryScreen}
    />
  );
};

export default React.memo(withNavigation(TagItemContainer));