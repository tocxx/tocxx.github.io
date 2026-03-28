import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'tmpro',
})
export class TMProRichTextPipe implements PipeTransform {
  /*

   This pipe is used to convert Unity's TextMeshPro Rich Text code into HTML for browser view.
   TMPro Rich Text reference: https://docs.unity3d.com/Packages/com.unity.textmeshpro@4.0/manual/RichText.html

   by Tocxx

  */

  constructor(private sanitized: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    let result = value;

    // Security: Remove script tags
    result = result.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );

    // Handle newlines
    result = result.replace(/\n/g, '<br>');

    // Color tags - support hex, named colors, and rgba
    result = this.processColorTags(result);

    // Size tags - support both relative and absolute sizes
    result = this.processSizeTags(result);

    // Alignment tags
    result = this.processAlignmentTags(result);

    // Character spacing
    result = this.processCharacterSpacing(result);

    // Margin tags
    result = this.processMarginTags(result);

    // Indent tags
    result = this.processIndentTags(result);

    // All caps tags
    result = this.processAllCapsTags(result);

    // Small caps tags
    result = this.processSmallCapsTags(result);

    // Mark tags
    result = this.processMarkTags(result);

    // Alpha tags
    result = this.processAlphaTags(result);

    // Space tags
    result = this.processSpaceTags(result);

    // Width tags
    result = this.processWidthTags(result);

    // Rotate tags
    result = this.processRotateTags(result);

    return this.sanitized.bypassSecurityTrustHtml(result);
  }

  private processColorTags(text: string): string {
    // Hex colors: <color=#FF0000>
    text = text.replace(
      /<color=#([0-9A-Fa-f]{6})>/g,
      '<span style="color:#$1">'
    );

    // Named colors: <color=red>
    const colorMap: { [key: string]: string } = {
      red: '#FF0000',
      green: '#00FF00',
      blue: '#0000FF',
      yellow: '#FFFF00',
      white: '#FFFFFF',
      black: '#000000',
      orange: '#FFA500',
      purple: '#800080',
    };

    for (const [colorName, hexValue] of Object.entries(colorMap)) {
      text = text.replace(
        new RegExp(`<color=${colorName}>`, 'gi'),
        `<span style="color:${hexValue}">`
      );
    }

    // Close color tags
    text = text.replace(/<\/color>/g, '</span>');

    return text;
  }

  private processSizeTags(text: string): string {
    // Relative sizes: <size=1> to <size=6>
    const sizeMap: { [key: string]: string } = {
      '1': 'text-xs',
      '2': 'text-sm',
      '3': 'text-base',
      '4': 'text-lg',
      '5': 'text-xl',
      '6': 'text-2xl',
    };

    for (const [size, className] of Object.entries(sizeMap)) {
      text = text.replace(
        new RegExp(`<size=${size}>`, 'g'),
        `</span><span class="${className}">`
      );
    }

    // Remove first span
    text = text.replace('</span>', '');

    return text + '</span>';
  }

  private processAlignmentTags(text: string): string {
    const alignmentMap: { [key: string]: string } = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    for (const [align, className] of Object.entries(alignmentMap)) {
      text = text.replace(
        new RegExp(`<align=${align}>`, 'gi'),
        `<div class="${className}">`
      );
    }

    // Close align tags
    text = text.replace(/<\/align>/g, '</div>');

    return text;
  }

  private processCharacterSpacing(text: string): string {
    // Relative spaces: <cspace=-0.05em> to <cspace=0.1em>
    const spaceMap: { [key: string]: string } = {
      '-0.05': 'tracking-tighter',
      '-0.025': 'tracking-tight',
      '0': 'tracking-normal',
      '0.025': 'tracking-wide',
      '0.05': 'tracking-wider',
      '0.1': 'tracking-widest',
    };

    for (const [space, className] of Object.entries(spaceMap)) {
      text = text.replace(
        new RegExp(`<cspace=${space}em>`, 'g'),
        `</span><span class="${className}">`
      );
    }

    //Remove first span
    text = text.replace('</span>', '');

    return text + '</span>';
  }

  private processMarginTags(text: string): string {
    // Margin: <margin=10> or <margin=10,20,30,40>
    text = text.replace(/<margin=([\d,\s]+)>/g, (match, values) => {
      const margins = values.split(',').map((v: string) => v.trim() + 'px');
      if (margins.length === 1) {
        return `<span style="margin:${margins[0]}">`;
      } else if (margins.length === 4) {
        return `<span style="margin:${margins.join(' ')}">`;
      }
      return match;
    });
    text = text.replace(/<\/margin>/g, '</span>');

    return text;
  }

  private processIndentTags(text: string): string {
    // Indent: <indent=10>
    text = text.replace(/<indent=(\d+)>/g, '<span style="margin-left:$1px">');
    text = text.replace(/<\/indent>/g, '</span>');

    return text;
  }

  private processAllCapsTags(text: string): string {
    // All caps: <allcaps>
    text = text.replace(/<allcaps>/g, '<span class="uppercase">');
    text = text.replace(/<\/allcaps>/g, '</span>');

    return text;
  }

  private processSmallCapsTags(text: string): string {
    // Small caps: <smallcaps>
    text = text.replace(
      /<smallcaps>/g,
      '<span style="font-variant:small-caps">'
    );
    text = text.replace(/<\/smallcaps>/g, '</span>');

    return text;
  }

  private processMarkTags(text: string): string {
    // Mark: <mark=#FF0000>
    text = text.replace(
      /<mark=#([0-9A-Fa-f]{6})>/g,
      '<mark style="background-color:#80$1">'
    );
    text = text.replace(/<\/mark>/g, '</mark>');

    return text;
  }

  private processAlphaTags(text: string): string {
    // Alpha: <alpha=#FF>
    text = text.replace(/<alpha=#([\d.]+)>/g, '<span style="opacity:$1">');
    text = text.replace(/<\/alpha>/g, '</span>');

    return text;
  }

  private processSpaceTags(text: string): string {
    // Space: <space=10>
    text = text.replace(/<space=(\d+)>/g, '<span style="margin-right:$1px">');
    text = text.replace(/<\/space>/g, '</span>');

    return text;
  }

  private processWidthTags(text: string): string {
    // Width: <width=100>
    text = text.replace(
      /<width=(\d+)>/g,
      '<span style="width:$1px;display:inline-block">'
    );
    text = text.replace(/<\/width>/g, '</span>');

    return text;
  }

  private processRotateTags(text: string): string {
    // Rotate: <rotate=45>
    text = text.replace(
      /<rotate=([-\d.]+)>/g,
      '<span style="transform:rotate($1deg);display:inline-block">'
    );
    text = text.replace(/<\/rotate>/g, '</span>');

    return text;
  }
}
