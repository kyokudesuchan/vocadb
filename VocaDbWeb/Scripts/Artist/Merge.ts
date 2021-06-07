import RepositoryFactory from '@Repositories/RepositoryFactory';
import { container } from '@Shared/inversify.config';
import ArtistMergeViewModel from '@ViewModels/Artist/ArtistMergeViewModel';
import $ from 'jquery';
import ko from 'knockout';

const ArtistMerge = (model: { id: number }): void => {
	$(function () {
		const repoFactory = container.get(RepositoryFactory);
		var repo = repoFactory.artistRepository();
		var vm = new ArtistMergeViewModel(repo, model.id);
		ko.applyBindings(vm);

		$('#mergeBtn').click(function () {
			return window.confirm('Are you sure you want to merge the artists?');
		});
	});
};

export default ArtistMerge;