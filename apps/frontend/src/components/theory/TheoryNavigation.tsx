/**
 * Theory Navigation Component
 * Hierarchical navigation cho theory content
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, BookOpen, FileText, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDirectoryStructure } from '@/lib/theory/file-operations';
import type { DirectoryStructure, FileInfo } from '@/lib/theory/file-operations';

interface NavigationItem {
  id: string;
  name: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  type: 'subject' | 'grade' | 'chapter' | 'file';
}

/**
 * Theory Navigation Component
 * Tree structure navigation với collapsible sections
 */
export function TheoryNavigation() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['toan']));
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Load navigation data
  useEffect(() => {
    async function loadNavigation() {
      try {
        const directoryStructure = await getDirectoryStructure();

        const items = buildNavigationTree(directoryStructure);
        setNavigationItems(items);
      } catch (error) {
        console.error('Error loading navigation:', error);
      } finally {
        setLoading(false);
      }
    }

    loadNavigation();
  }, []);

  // Auto-expand current path
  useEffect(() => {
    if (pathname.startsWith('/theory/')) {
      const pathSegments = pathname.split('/').filter(Boolean);

      // Use functional update to avoid dependency on expandedItems
      setExpandedItems(prevExpanded => {
        const newExpanded = new Set(prevExpanded);

        // Expand path segments
        let currentPath = '';
        pathSegments.forEach(segment => {
          currentPath += segment;
          newExpanded.add(currentPath);
          currentPath += '-';
        });

        return newExpanded;
      });
    }
  }, [pathname]); // ✅ Fixed: Removed expandedItems from dependency array

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav className="p-4">
      <div className="space-y-1">
        {navigationItems.map((item) => (
          <NavigationItemComponent
            key={item.id}
            item={item}
            level={0}
            expandedItems={expandedItems}
            onToggle={toggleExpanded}
            isActive={isActive}
          />
        ))}
      </div>
    </nav>
  );
}

/**
 * Navigation Item Component
 * Recursive component cho navigation items
 */
interface NavigationItemComponentProps {
  item: NavigationItem;
  level: number;
  expandedItems: Set<string>;
  onToggle: (itemId: string) => void;
  isActive: (href: string) => boolean;
}

function NavigationItemComponent({
  item,
  level,
  expandedItems,
  onToggle,
  isActive
}: NavigationItemComponentProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const active = item.href ? isActive(item.href) : false;

  const paddingLeft = level * 16 + 8; // 16px per level + 8px base

  const ItemContent = () => (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
        "hover:bg-muted/50",
        active && "bg-primary/10 text-primary font-medium",
        !active && "text-muted-foreground hover:text-foreground"
      )}
      style={{ paddingLeft }}
    >
      {hasChildren && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggle(item.id);
          }}
          className="flex-shrink-0 p-0.5 hover:bg-muted rounded"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
      )}
      
      {!hasChildren && <div className="w-4" />}
      
      {item.icon && <div className="flex-shrink-0">{item.icon}</div>}
      
      <span className="truncate">{item.name}</span>
    </div>
  );

  return (
    <div>
      {item.href ? (
        <Link href={item.href}>
          <ItemContent />
        </Link>
      ) : (
        <div className="cursor-pointer" onClick={() => hasChildren && onToggle(item.id)}>
          <ItemContent />
        </div>
      )}

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <NavigationItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              expandedItems={expandedItems}
              onToggle={onToggle}
              isActive={isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Build navigation tree from directory structure
 */
function buildNavigationTree(
  directoryStructure: DirectoryStructure
): NavigationItem[] {
  const items: NavigationItem[] = [];

  // Group files by subject and grade
  directoryStructure.subjects.forEach(subject => {
    const subjectItem: NavigationItem = {
      id: subject.name.toLowerCase(),
      name: subject.name,
      type: 'subject',
      icon: <BookOpen className="h-4 w-4" />,
      children: []
    };

    subject.grades.forEach(grade => {
      const gradeItem: NavigationItem = {
        id: `${subject.name.toLowerCase()}-${grade.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: grade.name,
        href: `/theory/${grade.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'grade',
        icon: <Folder className="h-4 w-4" />,
        children: []
      };

      // Group files by chapter
      const chapterMap = new Map<string, FileInfo[]>();
      grade.files.forEach(file => {
        if (file.chapter) {
          if (!chapterMap.has(file.chapter)) {
            chapterMap.set(file.chapter, []);
          }
          chapterMap.get(file.chapter)!.push(file);
        }
      });

      // Create chapter items
      Array.from(chapterMap.entries()).forEach(([chapterName, files]) => {
        const chapterItem: NavigationItem = {
          id: `${gradeItem.id}-${chapterName.toLowerCase().replace(/\s+/g, '-')}`,
          name: chapterName,
          href: `/theory/${grade.name.toLowerCase().replace(/\s+/g, '-')}/${chapterName.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'chapter',
          icon: <Folder className="h-4 w-4" />,
          children: []
        };

        // Add files to chapter
        files.forEach(file => {
          const fileName = file.fileName.replace('.tex', '');
          chapterItem.children!.push({
            id: `${chapterItem.id}-${fileName.toLowerCase().replace(/\s+/g, '-')}`,
            name: fileName,
            href: `/theory/${grade.name.toLowerCase().replace(/\s+/g, '-')}/${chapterName.toLowerCase().replace(/\s+/g, '-')}/${fileName.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'file',
            icon: <FileText className="h-4 w-4" />
          });
        });

        gradeItem.children!.push(chapterItem);
      });

      subjectItem.children!.push(gradeItem);
    });

    items.push(subjectItem);
  });

  return items;
}
