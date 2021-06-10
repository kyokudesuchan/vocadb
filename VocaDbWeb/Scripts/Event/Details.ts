import CommentContract from '@DataContracts/CommentContract';
import TagUsageForApiContract from '@DataContracts/Tag/TagUsageForApiContract';
import UserBaseContract from '@DataContracts/User/UserBaseContract';
import UserEventRelationshipType from '@Models/Users/UserEventRelationshipType';
import RepositoryFactory from '@Repositories/RepositoryFactory';
import HttpClient from '@Shared/HttpClient';
import UrlMapper from '@Shared/UrlMapper';
import vdb from '@Shared/VdbStatic';
import { container } from '@Shared/inversify.config';
import ReleaseEventDetailsViewModel from '@ViewModels/ReleaseEvent/ReleaseEventDetailsViewModel';
import { IEntryReportType } from '@ViewModels/ReportEntryViewModel';
import $ from 'jquery';
import ko from 'knockout';

const EventDetails = (
	canDeleteAllComments: boolean,
	eventAssociationType: UserEventRelationshipType,
	model: {
		id: number;
		latestComments: CommentContract[];
		tags: TagUsageForApiContract[];
		usersAttending: UserBaseContract[];
	},
	reportTypes: IEntryReportType[],
): void => {
	$(function () {
		$('#editEventLink').button({
			disabled: $('#editEventLink').hasClass('disabled'),
			icons: { primary: 'ui-icon-wrench' },
		});
		$('#viewVersions').button({ icons: { primary: 'ui-icon-clock' } });
		$('#reportEntryLink').button({ icons: { primary: 'ui-icon-alert' } });
		$('#manageTags').button({ icons: { primary: 'ui-icon-wrench' } });

		var loggedUserId = vdb.values.loggedUserId;
		const httpClient = new HttpClient();
		var rootPath = vdb.values.baseAddress;
		var urlMapper = new UrlMapper(rootPath);
		var repoFactory = container.get(RepositoryFactory);
		var eventRepo = repoFactory.eventRepository();
		var userRepo = repoFactory.userRepository();
		var latestComments = model.latestComments;
		var users = model.usersAttending;
		var tags = model.tags;

		var vm = new ReleaseEventDetailsViewModel(
			httpClient,
			urlMapper,
			eventRepo,
			userRepo,
			latestComments,
			reportTypes,
			loggedUserId,
			model.id,
			eventAssociationType,
			users,
			tags,
			canDeleteAllComments,
		);
		ko.applyBindings(vm);

		$('.artistLink').vdbArtistToolTip();
	});
};

export default EventDetails;
