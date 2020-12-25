#nullable disable

using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Resources;
using AspNetCore.CacheOutput;
using Microsoft.AspNetCore.Mvc;
using VocaDb.Web.Resources.Domain.ReleaseEvents;
using ApiController = Microsoft.AspNetCore.Mvc.ControllerBase;

namespace VocaDb.Web.Controllers.Api
{
	/// <summary>
	/// Loads localized string resources.
	/// </summary>
	[Route("api/resources")]
	[ApiController]
	public class ResourcesApiController : ApiController
	{
		private const int CacheDuration = Model.Domain.Constants.SecondsInADay;

		private readonly Dictionary<string, ResourceManager> allSets = new()
		{
			{ "activityEntry_activityFeedEventNames", HelperRes.ActivityFeedHelperStrings.ResourceManager },
			{ "album_albumEditableFieldNames", global::Resources.AlbumEditableFieldNames.ResourceManager },
			{ "artist_artistEditableFieldNames", global::Resources.ArtistEditableFieldNames.ResourceManager },
			{ "releaseEvent_releaseEventEditableFieldNames", global::Resources.ReleaseEventEditableFieldNames.ResourceManager },
			{ "song_songEditableFieldNames", global::Resources.SongEditableFieldNames.ResourceManager },
			{ "songList_songListEditableFieldNames", global::Resources.SongListEditableFieldNames.ResourceManager },
			{ "songList_songListFeaturedCategoryNames", global::Resources.SongListFeaturedCategoryNames.ResourceManager },
			{ "tag_tagEditableFieldNames", global::Resources.TagEditableFieldNames.ResourceManager },
			{ "user_ratedSongForUserSortRuleNames", global::Resources.RatedSongForUserSortRuleNames.ResourceManager },
			{ "activityEntrySortRuleNames", global::Resources.ActivityEntrySortRuleNames.ResourceManager },
			{ "albumCollectionStatusNames", global::Resources.AlbumCollectionStatusNames.ResourceManager },
			{ "albumMediaTypeNames", global::Resources.AlbumMediaTypeNames.ResourceManager },
			{ "albumSortRuleNames", global::Resources.AlbumSortRuleNames.ResourceManager },
			{ "artistSortRuleNames", global::Resources.ArtistSortRuleNames.ResourceManager },
			{ "artistTypeNames", Model.Resources.ArtistTypeNames.ResourceManager },
			{ "contentLanguageSelectionNames", global::Resources.ContentLanguageSelectionNames.ResourceManager },
			{ "discTypeNames", Model.Resources.Albums.DiscTypeNames.ResourceManager },
			{ "entryTypeNames", Resources.Domain.EntryTypeNames.ResourceManager },
			{ "eventCategoryNames", EventCategoryNames.ResourceManager },
			{ "eventSortRuleNames", EventSortRuleNames.ResourceManager },
			{ "songListSortRuleNames", Resources.Views.SongList.SongListSortRuleNames.ResourceManager },
			{ "songSortRuleNames", global::Resources.SongSortRuleNames.ResourceManager },
			{ "songTypeNames", Model.Resources.Songs.SongTypeNames.ResourceManager },
			{ "userGroupNames", global::Resources.UserGroupNames.ResourceManager },
		};

		private Dictionary<string, string> GetResources(string setName, CultureInfo culture)
		{
			if (!allSets.TryGetValue(setName, out ResourceManager resourceManager))
				return new Dictionary<string, string>();

			var set = resourceManager.GetResourceSet(culture, true, true);
			return set.Cast<DictionaryEntry>().ToDictionary(s => (string)s.Key, s => (string)s.Value);
		}

		/// <summary>
		/// Gets a number of resource sets for a specific culture.
		/// </summary>
		/// <param name="cultureCode">Culture code, for example "en-US" or "fi-FI".</param>
		/// <param name="setNames">Names of resource sets to be returned. More than one value can be specified. For example "artistTypeNames"</param>
		/// <returns>Resource sets. Cannot be null.</returns>
		[HttpGet("{cultureCode}")]
		[CacheOutput(ClientTimeSpan = CacheDuration, ServerTimeSpan = CacheDuration)]
		public Dictionary<string, Dictionary<string, string>> GetList(string cultureCode, [FromQuery(Name = "setNames[]")] string[] setNames)
		{
			if (setNames == null || !setNames.Any())
			{
				return new Dictionary<string, Dictionary<string, string>>();
			}

			CultureInfo culture = null;
			if (!string.IsNullOrEmpty(cultureCode))
			{
				try
				{
					culture = CultureInfo.GetCultureInfo(cultureCode);
				}
				catch (CultureNotFoundException) { }
			}

			if (culture == null)
				culture = CultureInfo.GetCultureInfo("en-US");

			var sets = setNames.Distinct().ToDictionary(s => s, s => GetResources(s, culture));
			return sets;
		}
	}
}