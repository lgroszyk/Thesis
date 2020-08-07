using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca informacje o antykwariacie
  public class Config : Entity
  {
    [Required, MaxLength(1000000)]
    public string RulesPl { get; set; }

    [Required, MaxLength(1000000)]
    public string RulesEn { get; set; }

    [Required, MaxLength(1000000)]
    public string PrivacyPolicyPl { get; set; }

    [Required, MaxLength(1000000)]
    public string PrivacyPolicyEn { get; set; }

    [Required, MaxLength(10000)]
    public string ComplaintsPl { get; set; }

    [Required, MaxLength(10000)]
    public string ComplaintsEn { get; set; }

    [Required, MaxLength(10000)]
    public string AboutRulesPl { get; set; }

    [Required, MaxLength(10000)]
    public string AboutRulesEn { get; set; }

    [Required, MaxLength(10000)]
    public string Address { get; set; }

    [Required, MaxLength(10000)]
    public string Timetable { get; set; }

    [Required, MaxLength(1000000)]
    public string AboutUs { get; set; }
  }
}
