import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';

class LaTeXText extends StatelessWidget {
  final String text;
  final TextStyle? textStyle;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow? overflow;

  const LaTeXText({
    super.key,
    required this.text,
    this.textStyle,
    this.textAlign,
    this.maxLines,
    this.overflow,
  });

  @override
  Widget build(BuildContext context) {
    final defaultStyle = textStyle ?? Theme.of(context).textTheme.bodyMedium!;
    
    // Parse LaTeX content
    final segments = _parseLatex(text);
    
    if (segments.length == 1 && !segments.first.isLatex) {
      // No LaTeX, return simple Text
      return Text(
        text,
        style: defaultStyle,
        textAlign: textAlign,
        maxLines: maxLines,
        overflow: overflow,
      );
    }
    
    // Mixed content
    return Wrap(
      alignment: _getWrapAlignment(),
      crossAxisAlignment: WrapCrossAlignment.center,
      children: segments.map((segment) {
        if (segment.isLatex) {
          try {
            return Math.tex(
              segment.content,
              textStyle: defaultStyle,
              mathStyle: MathStyle.text,
            );
          } catch (e) {
            // Fallback to text if LaTeX parsing fails
            return Text(
              r'\(' + segment.content + r'\)',
              style: defaultStyle.copyWith(color: Colors.red),
            );
          }
        } else {
          return Text(
            segment.content,
            style: defaultStyle,
          );
        }
      }).toList(),
    );
  }

  WrapAlignment _getWrapAlignment() {
    switch (textAlign) {
      case TextAlign.center:
        return WrapAlignment.center;
      case TextAlign.right:
      case TextAlign.end:
        return WrapAlignment.end;
      case TextAlign.justify:
        return WrapAlignment.spaceAround;
      default:
        return WrapAlignment.start;
    }
  }

  List<_TextSegment> _parseLatex(String text) {
    final segments = <_TextSegment>[];
    final regex = RegExp(r'\\\((.+?)\\\)|\\\[(.+?)\\\]', dotAll: true);
    
    int lastEnd = 0;
    
    for (final match in regex.allMatches(text)) {
      // Add text before LaTeX
      if (match.start > lastEnd) {
        segments.add(_TextSegment(
          content: text.substring(lastEnd, match.start),
          isLatex: false,
        ));
      }
      
      // Add LaTeX content
      final latexContent = match.group(1) ?? match.group(2) ?? '';
      segments.add(_TextSegment(
        content: latexContent,
        isLatex: true,
      ));
      
      lastEnd = match.end;
    }
    
    // Add remaining text
    if (lastEnd < text.length) {
      segments.add(_TextSegment(
        content: text.substring(lastEnd),
        isLatex: false,
      ));
    }
    
    return segments.isEmpty
        ? [_TextSegment(content: text, isLatex: false)]
        : segments;
  }
}

class _TextSegment {
  final String content;
  final bool isLatex;

  _TextSegment({
    required this.content,
    required this.isLatex,
  });
}

