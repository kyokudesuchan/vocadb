import ErrorNotFound from '@Components/Error/ErrorNotFound';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

const TagIndex = React.lazy(() => import('./TagIndex'));

const TagRoutes = (): React.ReactElement => {
	return (
		<Routes>
			<Route path="" element={<TagIndex />} />
			<Route path="*" element={<ErrorNotFound />} />
		</Routes>
	);
};

export default TagRoutes;
