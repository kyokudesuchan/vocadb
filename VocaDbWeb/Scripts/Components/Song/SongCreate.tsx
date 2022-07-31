import Alert from '@Bootstrap/Alert';
import Breadcrumb from '@Bootstrap/Breadcrumb';
import Button from '@Bootstrap/Button';
import SafeAnchor from '@Bootstrap/SafeAnchor';
import EntryType from '@Models/EntryType';
import SongType from '@Models/Songs/SongType';
import ArtistRepository from '@Repositories/ArtistRepository';
import SongRepository from '@Repositories/SongRepository';
import TagRepository from '@Repositories/TagRepository';
import EntryUrlMapper from '@Shared/EntryUrlMapper';
import HttpClient from '@Shared/HttpClient';
import SongCreateStore from '@Stores/Song/SongCreateStore';
import _ from 'lodash';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import ArtistAutoComplete from '../KnockoutExtensions/ArtistAutoComplete';
import { EntryToolTip } from '../KnockoutExtensions/EntryToolTip';
import Markdown from '../KnockoutExtensions/Markdown';
import Layout from '../Shared/Layout';
import ArtistLink from '../Shared/Partials/Artist/ArtistLink';
import { SongTypeDropdownList } from '../Shared/Partials/Knockout/DropdownList';
import SongLockingAutoComplete from '../Shared/Partials/Knockout/SongLockingAutoComplete';
import HelpLabel from '../Shared/Partials/Shared/HelpLabel';
import RequiredField from '../Shared/Partials/Shared/RequiredField';
import ValidationSummaryPanel from '../Shared/Partials/Shared/ValidationSummaryPanel';
import { showErrorMessage } from '../ui';
import useVocaDbTitle from '../useVocaDbTitle';

const httpClient = new HttpClient();

const songRepo = new SongRepository(httpClient, vdb.values.baseAddress);
const artistRepo = new ArtistRepository(httpClient, vdb.values.baseAddress);
const tagRepo = new TagRepository(httpClient, vdb.values.baseAddress);

interface SongCreateLayoutProps {
	songCreateStore: SongCreateStore;
}

const SongCreateLayout = observer(
	({ songCreateStore }: SongCreateLayoutProps): React.ReactElement => {
		const { t, ready } = useTranslation(['ViewRes', 'ViewRes.Song']);

		const title = t('ViewRes.Song:Create.SubmitSong');

		useVocaDbTitle(title, ready);

		const navigate = useNavigate();

		return (
			<Layout
				title={title}
				parents={
					<>
						<Breadcrumb.Item
							linkAs={Link}
							linkProps={{
								to: `/Song`,
							}}
						>
							{t('ViewRes:Shared.Songs')}
						</Breadcrumb.Item>
					</>
				}
			>
				<form
					onSubmit={async (e): Promise<void> => {
						e.preventDefault();

						try {
							const id = await songCreateStore.submit();

							navigate(EntryUrlMapper.details(EntryType.Song, id));
						} catch (e) {
							showErrorMessage(t('ViewRes.Song:Create.UnableToCreateSong'));

							throw e;
						}
					}}
				>
					{songCreateStore.errors && (
						<ValidationSummaryPanel
							message={t('ViewRes.Song:Create.UnableToCreateSong')}
							errors={songCreateStore.errors}
						/>
					)}

					<div className="row-fluid">
						<div className="span5 well well-transparent">
							{/* TODO: AjaxLoader */}

							{songCreateStore.isDuplicatePV && (
								<Alert variant="danger">
									{t('ViewRes.Song:Create.DuplicatePV')}
								</Alert>
							)}

							<div className="editor-label">
								<label htmlFor="pvUrl">
									{t('ViewRes.Song:Create.OriginalPV')}
								</label>
							</div>
							<div className="editor-field">
								<input
									type="text"
									id="pvUrl"
									value={songCreateStore.pv1}
									onChange={(e): void =>
										runInAction(() => {
											songCreateStore.pv1 = e.target.value;
										})
									}
									onBlur={songCreateStore.checkDuplicatesAndPV}
									className="span8"
									maxLength={255}
									size={30}
								/>
								{/* TODO: ValidationMessageFor */}
							</div>

							<div className="editor-label">
								<label htmlFor="reprintPVUrl">
									{t('ViewRes.Song:Create.ReprintPV')}
								</label>
							</div>
							<div className="editor-field">
								<input
									type="text"
									id="reprintPVUrl"
									value={songCreateStore.pv2}
									onChange={(e): void =>
										runInAction(() => {
											songCreateStore.pv2 = e.target.value;
										})
									}
									onBlur={songCreateStore.checkDuplicates}
									className="span8"
									maxLength={255}
									size={30}
								/>
								{/* TODO: ValidationMessageFor */}
							</div>

							<div className="editor-label">
								{t('ViewRes:EntryCreate.Name')} <RequiredField />
							</div>
							<div className="editor-field">
								{songCreateStore.errors && songCreateStore.errors.names && (
									<span className="field-validation-error">
										{songCreateStore.errors.names}
									</span>
								)}

								<table>
									<tbody>
										<tr>
											<td className="formLabel">
												<label htmlFor="nameOriginal">
													{t('ViewRes:EntryCreate.NonEnglishName')}
												</label>
											</td>
											<td>
												<input
													type="text"
													id="nameOriginal"
													value={songCreateStore.nameOriginal}
													onChange={(e): void =>
														runInAction(() => {
															songCreateStore.nameOriginal = e.target.value;
														})
													}
													onBlur={songCreateStore.checkDuplicates}
													className="span12"
													maxLength={255}
													size={40}
												/>
											</td>
										</tr>

										<tr>
											<td className="formLabel">
												<label htmlFor="nameRomaji">
													{t('ViewRes:EntryCreate.RomajiName')}
												</label>
											</td>
											<td>
												<input
													type="text"
													id="nameRomaji"
													value={songCreateStore.nameRomaji}
													onChange={(e): void =>
														runInAction(() => {
															songCreateStore.nameRomaji = e.target.value;
														})
													}
													onBlur={songCreateStore.checkDuplicates}
													className="span12"
													maxLength={255}
													size={40}
												/>
											</td>
										</tr>

										<tr>
											<td className="formLabel">
												<label htmlFor="nameEnglish">
													{t('ViewRes:EntryCreate.EnglishName')}
												</label>
											</td>
											<td>
												<input
													type="text"
													id="nameEnglish"
													value={songCreateStore.nameEnglish}
													onChange={(e): void =>
														runInAction(() => {
															songCreateStore.nameEnglish = e.target.value;
														})
													}
													onBlur={songCreateStore.checkDuplicates}
													className="span12"
													maxLength={255}
													size={40}
												/>
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							<div className="editor-label">
								<label htmlFor="songType">
									{t('ViewRes.Song:Create.SongType')}
								</label>
							</div>
							<div className="editor-field">
								<SongTypeDropdownList
									id="songType"
									value={songCreateStore.songType}
									onChange={(e): void =>
										runInAction(() => {
											songCreateStore.songType = e.target.value as SongType;
										})
									}
								/>
							</div>

							{songCreateStore.canHaveOriginalVersion && (
								<>
									<div className="editor-label">
										<HelpLabel
											label={t('ViewRes.Song:Edit.BaOriginalVersion')}
											title={t('ViewRes.Song:Edit.BaOriginalVersionHelp')}
										/>
									</div>
									<div className="editor-field">
										<div
											style={{ display: 'inline-block' }}
											className="input-append"
										>
											<SongLockingAutoComplete
												basicEntryLinkStore={songCreateStore.originalVersion}
											/>
										</div>
										{songCreateStore.originalVersion.isEmpty &&
											songCreateStore.originalSongSuggestions.length > 0 && (
												<div>
													<h4>
														{t('ViewRes.Song:Create.OriginalSuggestionsTitle')}
													</h4>
													<table>
														<tbody>
															{songCreateStore.originalSongSuggestions.map(
																(originalSongSuggestion, index) => (
																	<tr key={index}>
																		<td>
																			<EntryToolTip
																				as={Link}
																				value={originalSongSuggestion.entry}
																				to={EntryUrlMapper.details_entry(
																					originalSongSuggestion.entry,
																				)}
																				/* TODO: target="_blank" */
																			>
																				{
																					originalSongSuggestion.entry.name
																						.displayName
																				}
																			</EntryToolTip>{' '}
																			(
																			<span>
																				{
																					originalSongSuggestion.entry
																						.entryTypeName
																				}
																			</span>
																			)
																			{originalSongSuggestion.entry
																				.artistString && (
																				<div>
																					<span>
																						{
																							originalSongSuggestion.entry
																								.artistString
																						}
																					</span>
																				</div>
																			)}
																		</td>
																		<td style={{ maxWidth: '150px' }}>
																			<SafeAnchor
																				className="textLink acceptLink"
																				href="#"
																				onClick={(): Promise<void> =>
																					songCreateStore.selectOriginal(
																						originalSongSuggestion,
																					)
																				}
																			>
																				{t('ViewRes.Song:Create.Select')}
																			</SafeAnchor>
																		</td>
																	</tr>
																),
															)}
														</tbody>
													</table>
												</div>
											)}
									</div>
								</>
							)}

							<div className="editor-label">
								<span>{t('ViewRes.Song:Create.ArtistsInfo')}</span>{' '}
								<RequiredField />
								<br />
								<span className="extraInfo">
									{t('ViewRes.Song:Create.ArtistDesc')}
								</span>
							</div>
							<div className="editor-field">
								{songCreateStore.errors && songCreateStore.errors.artists && (
									<span className="field-validation-error">
										{songCreateStore.errors.artists}
									</span>
								)}
								<table>
									<tbody>
										{songCreateStore.artists.map((artist, index) => (
											<tr key={index}>
												<td>
													<ArtistLink
														artist={artist}
														tooltip
														typeLabel
														/* TODO: target="_blank" */
													/>
												</td>
												<td>
													<SafeAnchor
														onClick={(): void =>
															songCreateStore.removeArtist(artist)
														}
														href="#"
														className="textLink removeLink"
													>
														{t('ViewRes:Shared.Remove')}
													</SafeAnchor>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								<br />
								<ArtistAutoComplete
									type="text"
									properties={{
										acceptSelection: songCreateStore.addArtist,
										height: 300,
									}}
									maxLength={128}
									placeholder={t('ViewRes:Shared.Search')}
									className="span8"
								/>
							</div>

							<br />
							<p>
								<label className="checkbox">
									<input
										type="checkbox"
										checked={songCreateStore.draft}
										onChange={(e): void =>
											runInAction(() => {
												songCreateStore.draft = e.target.checked;
											})
										}
									/>
									{t('ViewRes.Song:Create.Draft')}
								</label>
							</p>

							<br />
							<Button
								type="submit"
								disabled={songCreateStore.submitting}
								variant="primary"
							>
								{t('ViewRes:Shared.Save')}
							</Button>
						</div>

						<div className="span4">
							<Alert variant="info" className="pre-line">
								<span
									dangerouslySetInnerHTML={{
										__html: vdb.resources.song.newSongInfo ?? '',
									}}
								/>
							</Alert>
							<Alert variant="info">
								<p>{t('ViewRes.Song:Create.NoArtistsToName')}</p>
								<p>{t('ViewRes.Song:Create.NameHelp')}</p>
								<p>{t('ViewRes.Song:Create.ArtistHelp')}</p>
							</Alert>

							{songCreateStore.songTypeInfo && (
								<Alert variant="info">
									<h3>
										<Link to={songCreateStore.songTypeTagUrl!}>
											{songCreateStore.songTypeName}
										</Link>
									</h3>
									<Markdown>
										{_.truncate(songCreateStore.songTypeInfo, {
											length: 500,
										})}
									</Markdown>
								</Alert>
							)}
						</div>
					</div>
				</form>
			</Layout>
		);
	},
);

const SongCreate = (): React.ReactElement => {
	const [searchParams] = useSearchParams();
	const pvUrl = searchParams.get('pvUrl');

	const [songCreateStore] = React.useState(
		() =>
			new SongCreateStore(vdb.values, songRepo, artistRepo, tagRepo, {
				pvUrl: pvUrl ?? '',
			}),
	);

	return <SongCreateLayout songCreateStore={songCreateStore} />;
};

export default SongCreate;