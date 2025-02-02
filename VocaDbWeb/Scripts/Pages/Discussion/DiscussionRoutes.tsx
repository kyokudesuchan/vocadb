import { Layout } from '@/Components/Shared/Layout';
import { useLoginManager } from '@/LoginManagerContext';
import ErrorNotFound from '@/Pages/Error/ErrorNotFound';
import { discussionRepo } from '@/Repositories/DiscussionRepository';
import { DiscussionIndexStore } from '@/Stores/Discussion/DiscussionIndexStore';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import '../../../wwwroot/Content/Styles/discussions.less';

const DiscussionFolders = React.lazy(() => import('./DiscussionFolders'));
const DiscussionIndex = React.lazy(() => import('./DiscussionIndex'));
const DiscussionTopics = React.lazy(() => import('./DiscussionTopics'));

interface DiscussionLayoutProps {
	pageTitle: string;
	ready: boolean;
	children?: React.ReactNode;
	title?: string;
}

export const DiscussionLayout = ({
	pageTitle,
	ready,
	children,
	title,
}: DiscussionLayoutProps): React.ReactElement => {
	return (
		<Layout pageTitle={pageTitle} ready={ready} title={title}>
			{children}
		</Layout>
	);
};

const DiscussionRoutes = (): React.ReactElement => {
	const loginManager = useLoginManager();

	const [discussionIndexStore] = React.useState(
		() =>
			new DiscussionIndexStore(
				loginManager,
				discussionRepo,
				loginManager.canDeleteComments,
			),
	);

	return (
		<Routes>
			<Route
				path=""
				element={
					<DiscussionIndex discussionIndexStore={discussionIndexStore} />
				}
			/>
			<Route
				path="folders/:folderId"
				element={
					<DiscussionFolders discussionIndexStore={discussionIndexStore} />
				}
			/>
			<Route
				path="topics/:topicId"
				element={
					<DiscussionTopics discussionIndexStore={discussionIndexStore} />
				}
			/>
			<Route path="*" element={<ErrorNotFound />} />
		</Routes>
	);
};

export default DiscussionRoutes;
