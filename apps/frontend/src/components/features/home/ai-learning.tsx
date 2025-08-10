"use client";

import { Brain, ChevronRight, LineChart, Target, Users, Sparkles } from "lucide-react";
import Link from "next/link";

// Import mockdata
import { aiLearningData } from "@/lib/mockdata";
import ScrollIndicator from "@/components/ui/scroll-indicator";

// Icon mapping
const iconMap = {
  Target: Target,
  LineChart: LineChart,
  Brain: Brain,
  Users: Users,
  Sparkles: Sparkles
};

const AILearning = () => {
  return (
    <section id="ai-learning-section" className="py-24 relative min-h-screen" style={{ backgroundColor: '#1F1F47' }}>




      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-secondary backdrop-blur-sm mb-3 transition-colors duration-300">
            <Sparkles className="h-3 w-3 mr-1.5" /> {aiLearningData.badge.text}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
            {aiLearningData.title}
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto transition-colors duration-300">
            {aiLearningData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <div className="space-y-4">
              {aiLearningData.features.map((feature) => {
                const IconComponent = iconMap[feature.icon as keyof typeof iconMap];

                return (
                  <div key={feature.id} className="bg-card border border-border rounded-xl p-4 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/20 text-secondary mt-0.5 transition-colors duration-300">
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-card-foreground mb-1.5 transition-colors duration-300">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm transition-colors duration-300">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href={aiLearningData.ctaButton.href} className="inline-flex items-center text-secondary font-medium mt-8 hover:text-primary transition-colors">
              {aiLearningData.ctaButton.text} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-2xl blur-lg"></div>

            <div className="relative">
              {/* Main dashboard UI - NyNus light mode colors */}
              <div className="bg-card border border-border dark:bg-slate-800/60 dark:border-slate-700/50 backdrop-blur-md p-4 rounded-xl shadow-lg transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary dark:bg-blue-500/30 dark:text-blue-400 flex items-center justify-center transition-colors duration-300">
                      <Users className="h-4 w-4 transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-card-foreground dark:text-white transition-colors duration-300">{aiLearningData.dashboard.profile.title}</h4>
                      <p className="text-xs text-muted-foreground dark:text-slate-400 transition-colors duration-300">{aiLearningData.dashboard.profile.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button className="w-6 h-6 rounded-md bg-muted text-muted-foreground dark:bg-slate-700/50 dark:text-slate-400 flex items-center justify-center transition-colors duration-300">
                      <ChevronRight className="h-3 w-3 transition-colors duration-300" />
                    </button>
                  </div>
                </div>

                {/* Analytics chart - NyNus colors */}
                <div className="mb-4">
                  <div className="bg-muted/50 border border-border/30 dark:bg-slate-700/30 rounded-lg p-3 mb-3 transition-colors duration-300">
                    <div className="flex justify-between mb-2">
                      <h5 className="text-xs font-medium text-foreground dark:text-slate-300 transition-colors duration-300">{aiLearningData.dashboard.analytics.title}</h5>
                      <span className="text-xs text-muted-foreground dark:text-slate-400 transition-colors duration-300">{aiLearningData.dashboard.analytics.lastUpdate}</span>
                    </div>

                    <div className="flex items-end gap-1 h-24">
                      {aiLearningData.dashboard.analytics.subjects.map((subject, index) => {
                        const colorClasses = {
                          primary: "bg-gradient-to-t from-primary to-primary/80",
                          secondary: "bg-gradient-to-t from-secondary to-secondary/80",
                          accent: "bg-gradient-to-t from-accent to-accent/80"
                        };

                        return (
                          <div
                            key={index}
                            className={`h-[${subject.percentage}%] w-1/6 rounded-t-md ${colorClasses[subject.color as keyof typeof colorClasses]}`}
                            style={{ height: `${subject.percentage}%` }}
                          ></div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground dark:text-slate-500 mt-2 transition-colors duration-300">
                      <span>Đại số</span>
                      <span>Hình học</span>
                      <span>Giải tích</span>
                    </div>
                  </div>

                  <div className="bg-muted/50 border border-border/30 dark:bg-slate-700/30 rounded-lg p-3 transition-colors duration-300">
                    <h5 className="text-xs font-medium text-foreground dark:text-slate-300 mb-3 transition-colors duration-300">{aiLearningData.dashboard.roadmap.title}</h5>

                    <div className="space-y-2">
                      {aiLearningData.dashboard.roadmap.tasks.map((task) => {
                        const colorClasses = {
                          primary: "bg-primary/15 text-primary dark:bg-blue-500/30 dark:text-blue-400",
                          secondary: "bg-secondary/15 text-secondary dark:bg-purple-500/30 dark:text-purple-400",
                          accent: "bg-accent/15 text-accent dark:bg-pink-500/30 dark:text-pink-400"
                        };
                        const progressColors = {
                          primary: "bg-primary",
                          secondary: "bg-secondary",
                          accent: "bg-accent"
                        };

                        return (
                          <div key={task.id} className="flex items-center gap-2 bg-background border border-border/20 dark:bg-slate-800/50 p-2 rounded-md transition-colors duration-300">
                            <div className={`w-6 h-6 rounded-full ${colorClasses[task.color as keyof typeof colorClasses]} flex items-center justify-center text-xs font-medium transition-colors duration-300`}>
                              {task.id}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-foreground dark:text-slate-300 transition-colors duration-300">{task.title}</p>
                              <div className="mt-0.5 h-1 w-full bg-muted dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
                                <div
                                  className={`h-full ${progressColors[task.color as keyof typeof progressColors]} rounded-full`}
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification - NyNus colors */}
              <div className="absolute -bottom-5 -right-5 bg-card border border-border dark:bg-slate-800/80 dark:border-slate-700/50 backdrop-blur-sm p-4 rounded-xl shadow-lg w-64 transition-colors duration-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-success/15 text-success dark:bg-green-500/20 dark:text-green-400 transition-colors duration-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-medium text-card-foreground dark:text-white text-sm transition-colors duration-300">{aiLearningData.dashboard.notification.title}</h5>
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1 transition-colors duration-300">{aiLearningData.dashboard.notification.message}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 via-secondary/15 to-accent/10 bg-cover bg-bottom bg-no-repeat transition-colors duration-300"></div>

      {/* Scroll indicator */}
      <ScrollIndicator targetSectionId="featured-courses-section" />
    </section>
  );
};

export default AILearning;
