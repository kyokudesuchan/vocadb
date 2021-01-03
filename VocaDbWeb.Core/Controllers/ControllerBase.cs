#nullable disable

using System;
using System.Net;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using NLog;
using VocaDb.Model.Domain;
using VocaDb.Model.Domain.Security;
using VocaDb.Model.Helpers;
using VocaDb.Model.Utils;
using VocaDb.Web.Code;
using VocaDb.Web.Helpers;

namespace VocaDb.Web.Controllers
{
	// TODO: implement
	public class ControllerBase : Controller
	{
		private static readonly Logger s_log = LogManager.GetCurrentClassLogger();
		protected static readonly TimeSpan ImageExpirationTime = TimeSpan.FromMinutes(5);
		protected const int EntriesPerPage = 30;
		protected const int InvalidId = 0;
		protected static readonly TimeSpan PictureCacheDuration = TimeSpan.FromDays(30);
		protected const int PictureCacheDurationSec = 30 * 24 * 60 * 60;
		protected const int StatsCacheDurationSec = 24 * 60 * 60;

		protected ControllerBase()
		{
			PageProperties.OpenGraph.Image = VocaUriBuilder.StaticResource("/img/vocaDB-title-large.png");
		}

		protected PagePropertiesData PageProperties => PagePropertiesData.Get(ViewBag);

		protected IUserPermissionContext PermissionContext => HttpContext.RequestServices.GetRequiredService<IUserPermissionContext>();

		private Login Login => HttpContext.RequestServices.GetRequiredService<Login>();

		protected ActionResult NoId()
		{
			return NotFound("No ID specified");
		}

		protected void AddFormSubmissionError(string details)
		{
			s_log.Warn("Form submission error: {0}", details);
			ModelState.AddModelError(string.Empty, $"Error while sending form contents - please try again. Diagnostic error message: {details}.");
		}

		protected void CheckConcurrentEdit(EntryType entryType, int id)
		{
			Login.Manager.VerifyLogin();

			var conflictingEditor = ConcurrentEntryEditManager.CheckConcurrentEdits(new EntryRef(entryType, id), Login.User);

			if (conflictingEditor.UserId != ConcurrentEntryEditManager.Nothing.UserId)
			{
				var ago = DateTime.Now - conflictingEditor.Time;

				if (ago.TotalMinutes < 1)
				{
					TempData.SetStatusMessage(string.Format(ViewRes.EntryEditStrings.ConcurrentEditWarningNow, conflictingEditor.UserName));
				}
				else
				{
					TempData.SetStatusMessage(string.Format(ViewRes.EntryEditStrings.ConcurrentEditWarning, conflictingEditor.UserName, (int)ago.TotalMinutes));
				}
			}
		}

		protected bool CheckUploadedPicture(IFormFile pictureUpload, string fieldName)
		{
			bool errors = false;

			if (pictureUpload.Length > ImageHelper.MaxImageSizeBytes)
			{
				ModelState.AddModelError(fieldName, "Picture file is too large.");
				errors = true;
			}

			if (!ImageHelper.IsValidImageExtension(pictureUpload.FileName))
			{
				ModelState.AddModelError(fieldName, "Picture format is not valid.");
				errors = true;
			}

			return !errors;
		}

		protected ActionResult HttpStatusCodeResult(HttpStatusCode code, string message)
		{
			Response.StatusCode = (int)code;
			// TODO: implement Response.StatusDescription = message;

			return Content((int)code + ": " + message);
		}

		protected void RestoreErrorsFromTempData()
		{
			// TODO: implement
		}

		protected void SaveErrorsToTempData()
		{
			// TODO: implement
		}

		protected void SetSearchEntryType(EntryType entryType)
		{
			PageProperties.GlobalSearchType = entryType;
		}

		protected ActionResult Xml(string content)
		{
			if (string.IsNullOrEmpty(content))
				return new EmptyResult();

			return Content(content, "text/xml", Encoding.UTF8);
		}
	}
}