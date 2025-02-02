import Breadcrumb from '@/Bootstrap/Breadcrumb';
import SafeAnchor from '@/Bootstrap/SafeAnchor';
import { Layout } from '@/Components/Shared/Layout';
import { ArchivedObjectVersionProperties } from '@/Components/Shared/Partials/ArchivedEntry/ArchivedObjectVersionProperties';
import { HiddenBanner } from '@/Components/Shared/Partials/EntryDetails/HiddenBanner';
import { ReportEntryVersionPopupKnockout } from '@/Components/Shared/Partials/EntryDetails/ReportEntryVersionPopupKnockout';
import { PrintArchivedVenueData } from '@/Components/Shared/Partials/Venue/PrintArchivedVenueData';
import { useChangedFieldNames } from '@/Components/useChangedFieldNames';
import { ArchivedVenueVersionDetailsContract } from '@/DataContracts/Venue/ArchivedVenueVersionDetailsContract';
import JQueryUIButton from '@/JQueryUI/JQueryUIButton';
import { useLoginManager } from '@/LoginManagerContext';
import { EntryType } from '@/Models/EntryType';
import { antiforgeryRepo } from '@/Repositories/AntiforgeryRepository';
import { venueRepo } from '@/Repositories/VenueRepository';
import { EntryUrlMapper } from '@/Shared/EntryUrlMapper';
import { ArchivedEntryStore } from '@/Stores/ArchivedEntryStore';
import { useLocationStateStore } from '@vocadb/route-sphere';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from 'react-router-dom';

interface VenueViewVersionLayoutProps {
	contract: ArchivedVenueVersionDetailsContract;
	archivedEntryStore: ArchivedEntryStore;
}

const VenueViewVersionLayout = observer(
	({
		contract,
		archivedEntryStore,
	}: VenueViewVersionLayoutProps): React.ReactElement => {
		const loginManager = useLoginManager();

		const { t } = useTranslation(['ViewRes']);

		const title = `Revision ${contract.archivedVersion.version} for ${contract.name}`; /* LOC */

		const changedFieldNames = useChangedFieldNames();

		useLocationStateStore(archivedEntryStore);

		return (
			<Layout
				pageTitle={title}
				ready={true}
				title={title}
				parents={
					<>
						<Breadcrumb.Item
							linkAs={Link}
							linkProps={{
								to: '/Venue',
							}}
							divider
						>
							{t(`ViewRes:Shared.Venues`)}
						</Breadcrumb.Item>
						<Breadcrumb.Item
							linkAs={Link}
							linkProps={{
								to: EntryUrlMapper.details(EntryType.Venue, contract.venue.id),
							}}
							divider
						>
							{contract.venue.name}
						</Breadcrumb.Item>
						<Breadcrumb.Item
							linkAs={Link}
							linkProps={{
								to: `/Venue/Versions/${contract.venue.id}`,
							}}
						>
							Revisions{/* LOC */}
						</Breadcrumb.Item>
					</>
				}
				toolbar={
					<>
						<JQueryUIButton
							as={SafeAnchor}
							href="#"
							onClick={archivedEntryStore.reportStore.show}
							icons={{ primary: 'ui-icon-alert' }}
						>
							{t('ViewRes:EntryDetails.ReportAnError')}
						</JQueryUIButton>{' '}
						{loginManager.canViewHiddenRevisions &&
							(contract.archivedVersion.hidden ? (
								<JQueryUIButton
									as="a"
									onClick={async (e): Promise<void> => {
										if (
											window.confirm(t('ViewRes:ViewVersion.ConfirmUnhide'))
										) {
											const requestToken = await antiforgeryRepo.getToken();

											await venueRepo.updateVersionVisibility(requestToken, {
												archivedVersionId: contract.archivedVersion.id,
												hidden: false,
											});

											window.location.reload();
										}
									}}
									icons={{ primary: 'ui-icon-unlocked' }}
								>
									{t('ViewRes:ViewVersion.UnhideVersion')}
								</JQueryUIButton>
							) : (
								<JQueryUIButton
									as="a"
									onClick={async (e): Promise<void> => {
										if (window.confirm(t('ViewRes:ViewVersion.ConfirmHide'))) {
											const requestToken = await antiforgeryRepo.getToken();

											await venueRepo.updateVersionVisibility(requestToken, {
												archivedVersionId: contract.archivedVersion.id,
												hidden: true,
											});

											window.location.reload();
										}
									}}
									icons={{ primary: 'ui-icon-locked' }}
								>
									{t('ViewRes:ViewVersion.HideVersion')}
								</JQueryUIButton>
							))}
					</>
				}
			>
				{contract.archivedVersion.hidden && <HiddenBanner />}

				{contract.comparableVersions.length > 0 && (
					<form className="form form-inline">
						Compare to:{/* LOC */}{' '}
						<select
							className="input-xlarge"
							value={archivedEntryStore.comparedVersionId}
							onChange={(e): void =>
								runInAction(() => {
									archivedEntryStore.comparedVersionId = e.target.value
										? Number(e.target.value)
										: undefined;
								})
							}
						>
							<option value="" />
							{contract.comparableVersions.map((comparableVersion) => (
								<option
									value={comparableVersion.id}
									key={comparableVersion.id}
								>{`${
									comparableVersion.version
								} (${comparableVersion.changedFields
									.map((changedField) =>
										changedFieldNames(EntryType.Venue, changedField),
									)
									.join(', ')} by ${comparableVersion.agentName})`}</option>
							))}
						</select>
					</form>
				)}

				<ArchivedObjectVersionProperties
					version={contract.archivedVersion}
					compareTo={contract.comparedVersion}
					entryType={EntryType.Venue}
				/>

				<PrintArchivedVenueData comparedVenues={contract.versions} />

				<ReportEntryVersionPopupKnockout
					reportEntryStore={archivedEntryStore.reportStore}
				/>
			</Layout>
		);
	},
);

const VenueViewVersion = (): React.ReactElement => {
	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const comparedVersionId = searchParams.get('comparedVersionId');

	const [model, setModel] = React.useState<{
		contract: ArchivedVenueVersionDetailsContract;
		archivedEntryStore: ArchivedEntryStore;
	}>();

	React.useEffect(() => {
		venueRepo
			.getVersionDetails({
				id: Number(id),
				comparedVersionId: comparedVersionId
					? Number(comparedVersionId)
					: undefined,
			})
			.then((contract) =>
				setModel({
					contract: contract,
					archivedEntryStore: new ArchivedEntryStore(
						contract.venue.id,
						contract.archivedVersion.version,
						venueRepo,
					),
				}),
			);
	}, [id, comparedVersionId]);

	return model ? (
		<VenueViewVersionLayout
			contract={model.contract}
			archivedEntryStore={model.archivedEntryStore}
		/>
	) : (
		<></>
	);
};

export default VenueViewVersion;
