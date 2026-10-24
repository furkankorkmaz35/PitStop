/**
 * @file htmlHelper.js
 * @description ASP.NET Core MVC HtmlHelper Sisteminin Node.js/Express Karşılığı
 * 
 * Bu yardımcı modül, ASP.NET Core MVC'deki `@Html.BeginForm()`, `@Html.TextBox()`,
 * `@Html.Label()`, `@Html.DropDownList()` ve `@Html.Partial()` gibi standart
 * HtmlHelper metotlarının işlevselliğini sağlar.
 * 
 * Avantajları:
 * 1. Form elemanlarını tutarlı, standart CSS sınıfları ve erişilebilirlik (WAI-ARIA) öznitelikleriyle üretir.
 * 2. XSS (Cross-Site Scripting) saldırılarına karşı tüm girdi ve değerleri otomatik escape eder.
 * 3. Hata mesajlarını (ValidationMessage) ilgili form alanı ile otomatik ilişkilendirir.
 * 4. PartialView'lerin model ile birlikte doğrudan çağrılmasını sağlar (Html.Partial).
 */

import fs from 'node:fs';
import path from 'node:path';
import ejs from 'ejs';

// Şablon dosyalarını diskten tekrar tekrar okumamak için bellek önbelleği
const partialCache = new Map();

/**
 * XSS koruması için metinleri HTML varlıklarına dönüştürür.
 * @param {string} str 
 * @returns {string} Güvenli HTML metni
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Verilen JS nesnesini HTML öznitelik dizgisine çevirir.
 * Örn: { class: 'input', required: true } -> ' class="input" required'
 * @param {Object} attrs 
 * @returns {string}
 */
export function renderAttributes(attrs = {}) {
  if (!attrs || typeof attrs !== 'object') return '';
  const parts = [];

  for (const [key, value] of Object.entries(attrs)) {
    if (value === true) {
      parts.push(key);
    } else if (value !== false && value !== null && value !== undefined) {
      parts.push(`${key}="${escapeHtml(value)}"`);
    }
  }

  return parts.length ? ' ' + parts.join(' ') : '';
}

/**
 * HtmlHelper sınıfı / motoru
 */
export class HtmlHelper {
  /**
   * @param {string} viewsDir - View şablonlarının kök dizini
   * @param {Object} resLocals - Express yanıt yerel değişkenleri
   */
  constructor(viewsDir, resLocals = {}) {
    this.viewsDir = viewsDir;
    this.resLocals = resLocals;
  }

  /**
   * HTML Form açılış etiketini üretir.
   * ASP.NET MVC Karşılığı: `@using (Html.BeginForm(...))` veya `@Html.BeginForm(...)`
   * 
   * @param {string} action - Formun gönderileceği URL
   * @param {string} method - HTTP metodu (GET veya POST, varsayılan POST)
   * @param {Object} attributes - Ek HTML öznitelikleri (class, id, vb.)
   * @returns {string} <form> etiketi
   */
  BeginForm(action, method = 'POST', attributes = {}) {
    const safeAction = escapeHtml(action);
    const safeMethod = escapeHtml(method.toUpperCase());
    return `<form action="${safeAction}" method="${safeMethod}"${renderAttributes(attributes)}>`;
  }

  /**
   * HTML Form kapanış etiketini üretir.
   * ASP.NET MVC Karşılığı: `@Html.EndForm()` veya form bloğunun sonu
   * 
   * @returns {string} </form>
   */
  EndForm() {
    return '</form>';
  }

  /**
   * Bir form alanı için HTML Label etiketi üretir.
   * ASP.NET MVC Karşılığı: `@Html.Label("fieldName", "Görünecek Başlık")`
   * 
   * @param {string} forId - İlişkili input'un id değeri
   * @param {string} labelText - Ekranda görünecek etiket metni
   * @param {Object} attributes - Ek HTML öznitelikleri
   * @returns {string} <label> etiketi
   */
  Label(forId, labelText, attributes = {}) {
    const attrs = { ...attributes };
    // PitStop tasarım sistemindeki standart label sınıfını ekle
    attrs.class = attrs.class ? `field__label ${attrs.class}` : 'field__label';
    return `<label for="${escapeHtml(forId)}"${renderAttributes(attrs)}>${escapeHtml(labelText)}</label>`;
  }

  /**
   * Tek satırlı metin veya sayı giriş alanı üretir.
   * ASP.NET MVC Karşılığı: `@Html.TextBox("fieldName", model.Value, new { @class = "input" })`
   * 
   * @param {string} name - Alanın form ismi ve varsayılan id'si
   * @param {string|number} value - Alanın varsayılan değeri
   * @param {Object} attributes - Ek HTML öznitelikleri (type, placeholder, required vb.)
   * @returns {string} <input> etiketi
   */
  TextBox(name, value = '', attributes = {}) {
    const attrs = { ...attributes };
    const type = attrs.type || 'text';
    delete attrs.type; // type parametresini ayırdık

    const id = attrs.id || name;
    delete attrs.id;

    // PitStop tasarım sistemi varsayılan sınıfı
    attrs.class = attrs.class ? `input ${attrs.class}` : 'input';

    return `<input type="${escapeHtml(type)}" id="${escapeHtml(id)}" name="${escapeHtml(name)}" value="${escapeHtml(value)}"${renderAttributes(attrs)} />`;
  }

  /**
   * Çok satırlı metin alanı üretir.
   * ASP.NET MVC Karşılığı: `@Html.TextArea("fieldName", model.Value, 4, 50, new { ... })`
   * 
   * @param {string} name - Alanın adı
   * @param {string} value - Alanın içereceği metin
   * @param {Object} attributes - Ek HTML öznitelikleri (rows, placeholder vb.)
   * @returns {string} <textarea> etiketi
   */
  TextArea(name, value = '', attributes = {}) {
    const attrs = { ...attributes };
    const id = attrs.id || name;
    delete attrs.id;

    attrs.class = attrs.class ? `input ${attrs.class}` : 'input';

    return `<textarea id="${escapeHtml(id)}" name="${escapeHtml(name)}"${renderAttributes(attrs)}>${escapeHtml(value)}</textarea>`;
  }

  /**
   * Açılır liste (Dropdown / Select) bileşeni üretir.
   * ASP.NET MVC Karşılığı: `@Html.DropDownList("category", selectList, "-- Seçiniz --")`
   * 
   * @param {string} name - Select alan adı
   * @param {Array<string|Object>} options - Liste seçenekleri (ör: ['Seçenek 1'] veya [{ value: '1', text: 'Seçenek 1' }])
   * @param {string} selectedValue - Seçili gelecek değer
   * @param {Object} attributes - Ek HTML öznitelikleri
   * @returns {string} <select> ve <option> etiketleri
   */
  DropDownList(name, options = [], selectedValue = '', attributes = {}) {
    const attrs = { ...attributes };
    const id = attrs.id || name;
    delete attrs.id;

    attrs.class = attrs.class ? `input ${attrs.class}` : 'input';

    let optionsHtml = '';
    for (const opt of options) {
      let val = '';
      let text = '';
      if (typeof opt === 'object' && opt !== null) {
        val = opt.value !== undefined ? opt.value : opt.text;
        text = opt.text !== undefined ? opt.text : opt.value;
      } else {
        val = opt;
        text = opt;
      }

      const isSelected = String(val) === String(selectedValue);
      const selectedAttr = isSelected ? ' selected' : '';
      optionsHtml += `\n    <option value="${escapeHtml(val)}"${selectedAttr}>${escapeHtml(text)}</option>`;
    }

    return `<select id="${escapeHtml(id)}" name="${escapeHtml(name)}"${renderAttributes(attrs)}>${optionsHtml}\n</select>`;
  }

  /**
   * Gizli form alanı üretir.
   * ASP.NET MVC Karşılığı: `@Html.Hidden("fieldName", value)`
   * 
   * @param {string} name - Alan adı
   * @param {string|number} value - Değer
   * @param {Object} attributes - Ek öznitelikler
   * @returns {string} <input type="hidden"> etiketi
   */
  Hidden(name, value = '', attributes = {}) {
    return `<input type="hidden" id="${escapeHtml(name)}" name="${escapeHtml(name)}" value="${escapeHtml(value)}"${renderAttributes(attributes)} />`;
  }

  /**
   * Form doğrulama hata mesajı üretir.
   * ASP.NET MVC Karşılığı: `@Html.ValidationMessage("fieldName")`
   * 
   * @param {string} fieldName - Hatanın ait olduğu alan adı
   * @param {Object} errors - Controller'dan gelen hata nesnesi ({ fieldName: 'Hata metni' })
   * @returns {string} Hata mesajı etiketi veya boşluk
   */
  ValidationMessage(fieldName, errors = {}) {
    if (!errors || !errors[fieldName]) return '';
    const errorText = errors[fieldName];
    return `<span class="field-validation-error" role="alert" style="display: block; margin-top: 4px; color: var(--color-warning, #f59e0b); font-size: var(--text-xs); font-weight: 500;">⚠ ${escapeHtml(errorText)}</span>`;
  }

  /**
   * Form gönderme (Submit) butonu üretir.
   * 
   * @param {string} text - Buton üzerindeki yazı
   * @param {Object} attributes - Buton öznitelikleri (class, id vb.)
   * @returns {string} <button type="submit"> etiketi
   */
  SubmitButton(text = 'Kaydet', attributes = {}) {
    const attrs = { ...attributes };
    attrs.class = attrs.class ? `button ${attrs.class}` : 'button';
    return `<button type="submit"${renderAttributes(attrs)}>${text}</button>`;
  }

  /**
   * HTML bağlantı (ActionLink) üretir.
   * ASP.NET MVC Karşılığı: `@Html.ActionLink("Yazı", "ActionName", "ControllerName")`
   * 
   * @param {string} linkText - Link yazısı
   * @param {string} href - Hedef URL
   * @param {Object} attributes - HTML öznitelikleri
   * @returns {string} <a> etiketi
   */
  ActionLink(linkText, href, attributes = {}) {
    return `<a href="${escapeHtml(href)}"${renderAttributes(attributes)}>${escapeHtml(linkText)}</a>`;
  }

  /**
   * PARTIAL VIEW ÇAĞIRICI:
   * Belirtilen kısmi görünümü (PartialView) verilen model nesnesi ile senkron olarak render eder.
   * ASP.NET MVC Karşılığı: `@Html.Partial("_PartialName", model)`
   * 
   * @param {string} partialName - Kısmi görünüm dosya adı (ör: 'partials/_UserLogCard' veya '_Alert')
   * @param {Object} model - Kısmi görünüme aktarılacak model verisi
   * @param {Object} customData - İlave görünüm verileri
   * @returns {string} Render edilmiş HTML çıktısı
   */
  Partial(partialName, model = {}, customData = {}) {
    let cleanPath = partialName;
    if (!cleanPath.endsWith('.ejs')) cleanPath += '.ejs';

    // Şablonun tam disk yolunu çözümle
    let fullPath;
    if (path.isAbsolute(cleanPath)) {
      fullPath = cleanPath;
    } else if (cleanPath.startsWith('partials') || cleanPath.startsWith('/partials')) {
      fullPath = path.join(this.viewsDir, cleanPath.replace(/^\//, ''));
    } else {
      fullPath = path.join(this.viewsDir, 'partials', cleanPath);
    }

    // Diskten oku veya bellek önbelleğinden getir
    let templateStr = partialCache.get(fullPath);
    if (!templateStr) {
      if (!fs.existsSync(fullPath)) {
        throw new Error(`[Html.Partial] Belirtilen PartialView şablonu bulunamadı: ${fullPath}`);
      }
      templateStr = fs.readFileSync(fullPath, 'utf8');
      partialCache.set(fullPath, templateStr);
    }

    // PartialView şablonunun içinde erişilebilecek değişkenleri hazırla
    const renderContext = {
      ...this.resLocals,
      model,
      log: model,
      alert: model,
      ...customData,
      // İç içe partialview veya helper çağrıları için kendini geçir
      Html: this
    };

    // EJS ile senkron render gerçekleştir
    return ejs.render(templateStr, renderContext, {
      filename: fullPath,
      views: [this.viewsDir]
    });
  }
}
