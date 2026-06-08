
#!/usr/bin/env python3
"""
Print number of pages and first 2000 characters of page 1 from a PDF.

Usage: python script.py /path/to/file.pdf
"""
import sys
from pathlib import Path

try:
	import PyPDF2
except Exception as e:
	sys.exit(f"PyPDF2 is required: {e}")

def main():
	if len(sys.argv) < 2:
		sys.exit("Usage: python script.py /path/to/file.pdf")
	p = Path(sys.argv[1])
	if not p.exists():
		sys.exit(f"File not found: {p}")
	reader = PyPDF2.PdfReader(str(p))
	pages = len(reader.pages)
	print('PAGES', pages)
	if pages:
		text = reader.pages[0].extract_text() or ''
		print('---PAGE1---')
		print(text[:2000])

if __name__ == '__main__':
	main()
