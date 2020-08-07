using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji pobierania szczegółów dotyczących pliku ebooka znajdującego się na serwerze
  public class FileInfoDto
  {
    [Required]
    public int Id { get; set; }

    [Required, MaxLength(128)]
    public string Name { get; set; }

    [Required, MaxLength(256)]
    public string Url { get; set; }

    [Required]
    public double SizeInMb { get; set; }

    [Required]
    public DateTime UploadDate { get; set; }

    [MaxLength(16)]
    public string Username { get; set; }

    [Required, MaxLength(128)]
    public string NameWithExtension { get; set; }
  }
}
