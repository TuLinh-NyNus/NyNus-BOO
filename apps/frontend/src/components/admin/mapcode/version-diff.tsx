"use client";

/**
 * Version Comparison Tool Component
 * So sánh sự khác biệt giữa 2 versions của MapCode
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GitCompare, Loader2, Plus, Minus, ArrowLeftRight } from "lucide-react";
import { MapCodeClient, MapCodeVersionData } from "@/lib/grpc/mapcode-client";
import { toast } from "sonner";

interface VersionDiffProps {
  versions: MapCodeVersionData[];
  className?: string;
}

interface DiffResult {
  added: Array<{ key: string; value: string; section: string }>;
  removed: Array<{ key: string; value: string; section: string }>;
  modified: Array<{ key: string; oldValue: string; newValue: string; section: string }>;
  unchanged: number;
}

export function VersionDiff({ versions, className }: VersionDiffProps) {
  const [versionA, setVersionA] = useState<string>("");
  const [versionB, setVersionB] = useState<string>("");
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [comparing, setComparing] = useState(false);

  const handleCompare = async () => {
    if (!versionA || !versionB) {
      toast.error("Vui lòng chọn 2 versions để so sánh");
      return;
    }

    if (versionA === versionB) {
      toast.error("Không thể so sánh cùng một version");
      return;
    }

    try {
      setComparing(true);

      // TODO: Fetch both configs when API is available
      // For now, generate mock diff
      const mockDiff: DiffResult = {
        added: [
          { key: "9", section: "Grade", value: "Lớp 9" },
          { key: "X", section: "Chapter", value: "Chương X mới" },
        ],
        removed: [
          { key: "8", section: "Grade", value: "Lớp 8" },
        ],
        modified: [
          {
            key: "1",
            section: "Chapter",
            oldValue: "Mệnh đề và tập hợp",
            newValue: "Mệnh đề, tập hợp và logic",
          },
        ],
        unchanged: 4650,
      };

      setDiff(mockDiff);
      toast.success("So sánh versions thành công");
    } catch (error) {
      console.error("Error comparing versions:", error);
      toast.error("Không thể so sánh versions");
    } finally {
      setComparing(false);
    }
  };

  const handleSwapVersions = () => {
    const temp = versionA;
    setVersionA(versionB);
    setVersionB(temp);
  };

  const totalChanges = diff
    ? diff.added.length + diff.removed.length + diff.modified.length
    : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          <div>
            <CardTitle>So sánh Versions</CardTitle>
            <CardDescription>
              So sánh sự khác biệt giữa 2 MapCode versions
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Version Selectors */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Version A</label>
            <Select value={versionA} onValueChange={setVersionA}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn version A" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.version}
                    {v.isActive && (
                      <Badge variant="secondary" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapVersions}
            disabled={!versionA || !versionB}
            className="mb-0"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          <div className="space-y-2">
            <label className="text-sm font-medium">Version B</label>
            <Select value={versionB} onValueChange={setVersionB}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn version B" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.version}
                    {v.isActive && (
                      <Badge variant="secondary" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compare Button */}
        <Button
          onClick={handleCompare}
          disabled={!versionA || !versionB || comparing || versionA === versionB}
          className="w-full"
        >
          {comparing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Đang so sánh...
            </>
          ) : (
            <>
              <GitCompare className="h-4 w-4 mr-2" />
              So sánh
            </>
          )}
        </Button>

        {/* Diff Results */}
        {diff && (
          <>
            <Separator />

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {diff.added.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Thêm mới</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {diff.removed.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Đã xóa</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {diff.modified.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Đã sửa</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {diff.unchanged}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Không đổi
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Changes */}
            {totalChanges > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Added Items */}
                {diff.added.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                      <Plus className="h-4 w-4 text-green-600" />
                      Entries mới thêm ({diff.added.length})
                    </h4>
                    <div className="space-y-2">
                      {diff.added.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-green-50 border border-green-200 rounded-md text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-100">
                              {item.section}
                            </Badge>
                            <code className="font-mono font-semibold">
                              {item.key}
                            </code>
                            <span className="text-muted-foreground">→</span>
                            <span>{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Removed Items */}
                {diff.removed.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                      <Minus className="h-4 w-4 text-red-600" />
                      Entries đã xóa ({diff.removed.length})
                    </h4>
                    <div className="space-y-2">
                      {diff.removed.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-red-50 border border-red-200 rounded-md text-sm line-through"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-red-100">
                              {item.section}
                            </Badge>
                            <code className="font-mono font-semibold">
                              {item.key}
                            </code>
                            <span className="text-muted-foreground">→</span>
                            <span>{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modified Items */}
                {diff.modified.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                      <ArrowLeftRight className="h-4 w-4 text-yellow-600" />
                      Entries đã sửa đổi ({diff.modified.length})
                    </h4>
                    <div className="space-y-2">
                      {diff.modified.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-yellow-100">
                              {item.section}
                            </Badge>
                            <code className="font-mono font-semibold">
                              {item.key}
                            </code>
                          </div>
                          <div className="ml-4 space-y-1">
                            <div className="text-red-600 line-through">
                              - {item.oldValue}
                            </div>
                            <div className="text-green-600">
                              + {item.newValue}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {totalChanges === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="font-medium">Không có sự khác biệt</p>
                <p className="text-sm">
                  Hai versions này có cùng cấu hình MapCode
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}


