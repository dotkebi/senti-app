import React from 'react';
import { NetworkStatus } from 'apollo-client';
import { useQuery } from '@apollo/react-hooks';
import {
  ErrorView,
  LoadingView,
  StoryList,
} from 'components';
import { FETCH_TAG_STORY_FEED } from 'graphqls';

const EMPTY_LIST: Story[] = [];

type TagStoryFeedResult = {
  tagStoryFeed: {
    stories: Story[];
    cursor: string;
  };
};

interface Props {
  tagId: string;
}

const TagStoryListContainer: React.FunctionComponent<Props> = ({
  tagId,
}) => {
  const {
    data,
    networkStatus,
    error,
    fetchMore,
    refetch,
  } = useQuery<TagStoryFeedResult>(FETCH_TAG_STORY_FEED, {
    variables: {
      tagId,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (error || networkStatus === NetworkStatus.error) {
    const reload = () => refetch().catch(() => {});
    return <ErrorView reload={reload} message={error ? error.message : ''} />;
  }

  if (networkStatus === NetworkStatus.loading || !data || !data.tagStoryFeed) {
    return <LoadingView dark />;
  }

  const {
    tagStoryFeed: {
      stories,
      cursor,
    },
  } = data;

  return (
    <StoryList
      items={stories || EMPTY_LIST}
      isLoading={networkStatus === NetworkStatus.fetchMore}
      isRefreshing={networkStatus === NetworkStatus.refetch}
      onRefresh={refetch}
      onFetchMore={() => networkStatus !== NetworkStatus.fetchMore && fetchMore({
        variables: {
          tagId,
          cursor,
        },
        updateQuery: (original, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return original;
          }

          const {
            tagStoryFeed: {
              stories: nextStories,
              cursor: nextCursor,
            },
          } = fetchMoreResult;

          if (nextStories.length === 0) {
            return original;
          }

          return Object.assign(original, {
            tagStoryFeed: {
              ...original.tagStoryFeed,
              stories: original.tagStoryFeed.stories.concat(nextStories),
              cursor: nextCursor,
            },
          });
        },
      })}
    />
  );
};

export default React.memo(TagStoryListContainer);