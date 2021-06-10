import RepositoryFactory from '@Repositories/RepositoryFactory';
import { container } from '@Shared/inversify.config';
import ArchivedEntryViewModel from '@ViewModels/ArchivedEntryViewModel';
import $ from 'jquery';
import ko from 'knockout';

const EventViewVersion = (model: {
	entry: {
		archivedVersion: {
			version: number;
		};
		releaseEvent: {
			id: number;
		};
	};
}): void => {
	$(function () {
		$('#downloadXmlLink').button({
			icons: { primary: 'ui-icon-arrowthickstop-1-s' },
		});
		$('#reportEntryLink').button({ icons: { primary: 'ui-icon-alert' } });
		$('#showLink').button({ icons: { primary: 'ui-icon-unlocked' } });
		$('#hideLink').button({ icons: { primary: 'ui-icon-locked' } });

		var repoFactory = container.get(RepositoryFactory);
		var rep = repoFactory.eventRepository();
		var viewModel = new ArchivedEntryViewModel(
			model.entry.releaseEvent.id,
			model.entry.archivedVersion.version,
			rep,
		);
		ko.applyBindings(viewModel);
	});
};

export default EventViewVersion;
